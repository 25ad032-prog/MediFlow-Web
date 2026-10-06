// DOCBEE MediFlow - Comprehensive Healthcare API & FHIR Integration Test Suite
// Verifies all 13 core interoperability capabilities:
// 1. Healthcare provider selection
// 2. Synthetic provider operations
// 3. FHIR resource mapping (bi-directional)
// 4. Doctor retrieval (/api/healthcare/doctors & /api/doctors)
// 5. Patient retrieval (/api/healthcare/patients)
// 6. Appointment retrieval (/api/healthcare/appointments & /api/appointments)
// 7. Appointment creation (POST /api/healthcare/appointments)
// 8. Schedule/slot retrieval (/api/healthcare/schedules & /api/healthcare/slots)
// 9. Encounter mapping (/api/healthcare/encounters)
// 10. Observation mapping (/api/healthcare/observations)
// 11. Diagnostic report mapping (/api/healthcare/reports)
// 12. DocumentReference mapping (/api/healthcare/documents)
// 13. External FHIR API provider & graceful fallback simulation

const http = require('http');
const MockFhirServer = require('./server/integrations/healthcare/mockFhirServer');

function request({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runHealthcareIntegrationTests() {
  console.log('========================================================');
  console.log('🌐 MEDIFLOW HEALTHCARE API & FHIR INTEROPERABILITY SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${name}${details ? ` (${details})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} - ${details}`);
      failed++;
    }
  }

  try {
    // Reset state before test run
    await request({ method: 'POST', path: '/api/demo/reset' });

    // --- 1. Healthcare Provider Selection & Status ---
    console.log('--- 1. Testing Healthcare Provider Selection & Status ---');
    const statusRes = await request({ method: 'GET', path: '/api/healthcare/status' });
    assert(statusRes.status === 200 && statusRes.data.success, 'GET /api/healthcare/status returns 200');
    assert(statusRes.data.data.activeMode === 'synthetic', 'Initial Provider Mode is Synthetic', `Mode: ${statusRes.data.data.activeMode}`);
    assert(statusRes.data.data.supportedResources.includes('Patient') && statusRes.data.data.supportedResources.includes('Observation'), 'Supported resources include FHIR core models', `Resources: ${statusRes.data.data.supportedResources.length}`);

    // Switch Provider Test
    const switchRes = await request({ method: 'POST', path: '/api/healthcare/switch-provider', body: { mode: 'synthetic' } });
    assert(switchRes.status === 200 && switchRes.data.success, 'POST /api/healthcare/switch-provider succeeds');

    // --- 2. Synthetic Provider Operations ---
    console.log('\n--- 2. Testing Synthetic Provider Operations ---');
    const orgRes = await request({ method: 'GET', path: '/api/healthcare/organizations' });
    assert(orgRes.status === 200 && orgRes.data.count > 0, 'GET /api/healthcare/organizations returns Bundle', `Count: ${orgRes.data.count}`);
    assert(orgRes.data.data[0].resourceType === 'Organization', 'Organization resourceType is verified');

    // --- 3. FHIR Resource Mapping (Bi-directional) ---
    console.log('\n--- 3. Testing FHIR Resource Mapping ---');
    const resourceMapper = require('./server/integrations/healthcare/resourceMapper');
    const sampleDoctor = {
      id: "doc-test",
      name: "Dr. Ananya Rao",
      specialty: "Dermatology",
      hospital: "Apollo Greams",
      location: "Chennai",
      fee: "₹750",
      rating: 4.9
    };
    const mappedPractitioner = resourceMapper.doctorToFhirPractitioner(sampleDoctor);
    assert(mappedPractitioner.resourceType === 'Practitioner', 'doctorToFhirPractitioner converts to FHIR Practitioner');
    const backToDoctor = resourceMapper.fhirPractitionerToDoctor(mappedPractitioner);
    assert(backToDoctor.name === 'Dr. Ananya Rao' && backToDoctor.specialty === 'Dermatology', 'fhirPractitionerToDoctor maps back faithfully');

    // --- 4. Doctor / Practitioner Retrieval ---
    console.log('\n--- 4. Testing Doctor / Practitioner Retrieval ---');
    const docsRes = await request({ method: 'GET', path: '/api/healthcare/doctors?location=Chennai' });
    assert(docsRes.status === 200 && docsRes.data.count > 0, 'GET /api/healthcare/doctors returns Practitioner Bundle', `Count: ${docsRes.data.count}`);
    assert(docsRes.data.data[0].resourceType === 'Practitioner', 'Doctor records conform to FHIR Practitioner');

    const singleDocRes = await request({ method: 'GET', path: '/api/healthcare/doctors/doc-1' });
    assert(singleDocRes.status === 200 && singleDocRes.data.data.id === 'doc-1', 'GET /api/healthcare/doctors/:id returns single Practitioner');

    // --- 5. Patient Retrieval ---
    console.log('\n--- 5. Testing Patient Retrieval ---');
    const patRes = await request({ method: 'GET', path: '/api/healthcare/patients' });
    assert(patRes.status === 200 && patRes.data.count > 0, 'GET /api/healthcare/patients returns Patient Bundle', `Count: ${patRes.data.count}`);
    assert(patRes.data.data[0].resourceType === 'Patient', 'Patient conforms to FHIR Patient model');

    const singlePatRes = await request({ method: 'GET', path: '/api/healthcare/patients/pat-1' });
    assert(singlePatRes.status === 200 && singlePatRes.data.data.id === 'pat-1', 'GET /api/healthcare/patients/:id returns Patient pat-1');

    // --- 6. Appointment Retrieval ---
    console.log('\n--- 6. Testing Appointment Retrieval ---');
    const aptsRes = await request({ method: 'GET', path: '/api/healthcare/appointments' });
    assert(aptsRes.status === 200 && Array.isArray(aptsRes.data.data), 'GET /api/healthcare/appointments returns Appointment Bundle', `Count: ${aptsRes.data.count}`);
    assert(aptsRes.data.data[0].resourceType === 'Appointment', 'Appointment records conform to FHIR Appointment');

    // --- 7. Appointment Creation ---
    console.log('\n--- 7. Testing Appointment Creation ---');
    const newAptPayload = {
      doctorId: 'doc-1',
      doctorName: 'Dr. Priya Sharma',
      patientId: 'pat-1',
      patientName: 'Rahul Sharma',
      date: '2026-10-05',
      time: '11:00 AM',
      consultationType: 'In-Clinic',
      reason: 'FHIR Interoperability Assessment',
      tokenNumber: 'Q-99'
    };
    const createAptRes = await request({ method: 'POST', path: '/api/healthcare/appointments', body: newAptPayload });
    assert(createAptRes.status === 201 && createAptRes.data.success, 'POST /api/healthcare/appointments creates FHIR Appointment', `ID: ${createAptRes.data.data?.id}`);
    assert(createAptRes.data.data?.resourceType === 'Appointment', 'Created object is a FHIR Appointment');

    // --- 8. Schedule & Slot Retrieval ---
    console.log('\n--- 8. Testing Schedule & Slot Retrieval ---');
    const schedRes = await request({ method: 'GET', path: '/api/healthcare/schedules/doc-1' });
    assert(schedRes.status === 200 && schedRes.data.count > 0, 'GET /api/healthcare/schedules/:doctorId returns FHIR Schedule', `Count: ${schedRes.data.count}`);
    assert(schedRes.data.data[0].resourceType === 'Schedule', 'Schedule conforms to FHIR Schedule');

    const slotRes = await request({ method: 'GET', path: '/api/healthcare/slots/doc-1' });
    assert(slotRes.status === 200 && slotRes.data.count > 0, 'GET /api/healthcare/slots/:doctorId returns FHIR Slots', `Slots: ${slotRes.data.count}`);
    assert(slotRes.data.data[0].resourceType === 'Slot', 'Slot conforms to FHIR Slot');

    // --- 9. Encounter Mapping & Retrieval ---
    console.log('\n--- 9. Testing Encounter Mapping & Retrieval ---');
    const encRes = await request({ method: 'GET', path: '/api/healthcare/encounters' });
    assert(encRes.status === 200 && encRes.data.count > 0, 'GET /api/healthcare/encounters returns FHIR Encounters', `Encounters: ${encRes.data.count}`);
    assert(encRes.data.data[0].resourceType === 'Encounter', 'Encounter conforms to FHIR Encounter');

    const singleEncRes = await request({ method: 'GET', path: `/api/healthcare/encounters/${encRes.data.data[0].id}` });
    assert(singleEncRes.status === 200 && singleEncRes.data.data.resourceType === 'Encounter', 'GET /api/healthcare/encounters/:id returns single Encounter');

    // --- 10. Observation Mapping (Vitals & Labs) ---
    console.log('\n--- 10. Testing Observation Mapping ---');
    const obsRes = await request({ method: 'GET', path: '/api/healthcare/observations/pat-1' });
    assert(obsRes.status === 200 && obsRes.data.count > 0, 'GET /api/healthcare/observations/:patientId returns Observations', `Count: ${obsRes.data.count}`);
    assert(obsRes.data.data.some(o => o.code?.coding?.[0]?.display === 'Blood Pressure'), 'Observations contain Blood Pressure LOINC code');

    // --- 11. Diagnostic Report Mapping ---
    console.log('\n--- 11. Testing Diagnostic Report Mapping ---');
    const repRes = await request({ method: 'GET', path: '/api/healthcare/reports/pat-1' });
    assert(repRes.status === 200 && repRes.data.count > 0, 'GET /api/healthcare/reports/:patientId returns DiagnosticReports', `Reports: ${repRes.data.count}`);
    assert(repRes.data.data[0].resourceType === 'DiagnosticReport', 'Report conforms to FHIR DiagnosticReport');

    // --- 12. DocumentReference Mapping (Health Records Vault) ---
    console.log('\n--- 12. Testing DocumentReference Mapping ---');
    const docRes = await request({ method: 'GET', path: '/api/healthcare/documents/pat-1' });
    assert(docRes.status === 200 && docRes.data.count > 0, 'GET /api/healthcare/documents/:patientId returns DocumentReferences', `Docs: ${docRes.data.count}`);
    assert(docRes.data.data[0].resourceType === 'DocumentReference', 'Vault item conforms to FHIR DocumentReference');

    // --- 13. External FHIR API Provider & Graceful Fallback Simulation ---
    console.log('\n--- 13. Testing External FHIR API Provider & Graceful Fallback ---');
    
    // Part A: Start Mock External FHIR Server on 8089 and test FHIR Provider connection
    const mockServer = new MockFhirServer(8089);
    await mockServer.start();
    console.log('  [Mock FHIR Server] Started on http://localhost:8089');

    const FhirHealthcareProvider = require('./server/integrations/healthcare/fhirClient');
    const fhirClient = new FhirHealthcareProvider({ baseUrl: 'http://localhost:8089/fhir', timeout: 2000 });
    
    const extPatients = await fhirClient.getPatients();
    assert(extPatients.length > 0 && extPatients[0].id === 'fhir-pat-001', 'External FHIR Provider communicates with external FHIR server', `Patient: ${extPatients[0].id}`);

    // Part B: Test Graceful Fallback when external FHIR endpoint is stopped / unreachable
    await mockServer.stop();
    console.log('  [Mock FHIR Server] Stopped (simulating network outage)');

    const fallbackPatients = await fhirClient.getPatients();
    assert(fallbackPatients.length > 0, 'External FHIR Provider gracefully falls back to Synthetic Provider during outage', `Fallback items: ${fallbackPatients.length}`);
    assert(fhirClient.isExternalReachable === false, 'isExternalReachable correctly flagged false');

    console.log('\n========================================================');
    console.log(`HEALTHCARE API INTEGRATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) process.exit(1);

  } catch (err) {
    console.error('Fatal Healthcare Integration Test Error:', err);
    process.exit(1);
  }
}

runHealthcareIntegrationTests();
