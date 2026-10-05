// Comprehensive Automated Test Suite for MediFlow-Web Upgraded Architecture
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      if (typeof body === 'object') {
        body = JSON.stringify(body);
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(reqOptions, (res) => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        const text = rawBuffer.toString('utf8');
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {}

        const cookies = res.headers['set-cookie'] || [];
        const tokenCookie = cookies.find(c => c.startsWith('token='));
        let token = null;
        if (tokenCookie) {
          token = tokenCookie.split(';')[0].replace('token=', '');
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json || text,
          buffer: rawBuffer,
          token
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE MEDIFLOW UPGRADE TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Unauthenticated Protected Route Check
    console.log('--- 1. Testing Unauthenticated Protected Routes ---');
    const unauthRes = await makeRequest('/api/appointments');
    assert('GET /api/appointments without token returns 401', unauthRes.status === 401);

    // 2. Invalid Credentials Check
    console.log('\n--- 2. Testing Password Verification & Security ---');
    const invalidLogin = await makeRequest('/api/auth/login', { method: 'POST' }, {
      email: 'patient@mediflow.demo',
      password: 'WrongPassword123'
    });
    assert('Login with wrong password returns 401', invalidLogin.status === 401);

    // 3. Valid Patient Login & JWT Cookie Verification
    const patientLogin = await makeRequest('/api/auth/login', { method: 'POST' }, {
      email: 'patient@mediflow.demo',
      password: 'Patient@123',
      requestedRole: 'patient'
    });
    assert('Login with patient@mediflow.demo returns 200', patientLogin.status === 200);
    assert('Patient login returns JWT token in cookie/payload', Boolean(patientLogin.token || patientLogin.body?.token));
    assert('Password hash is NEVER returned in response', patientLogin.body?.user?.passwordHash === undefined);

    const patientToken = patientLogin.token || patientLogin.body.token;

    // 4. GET /api/auth/me for Authenticated Patient
    const meRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert('GET /api/auth/me returns patient profile', meRes.status === 200 && meRes.body?.user?.role === 'patient');

    // 5. Valid Doctor Login
    console.log('\n--- 3. Testing Doctor Role Authentication ---');
    const doctorLogin = await makeRequest('/api/auth/login', { method: 'POST' }, {
      email: 'doctor@mediflow.demo',
      password: 'Doctor@123',
      requestedRole: 'doctor'
    });
    assert('Login with doctor@mediflow.demo returns 200', doctorLogin.status === 200);
    assert('Doctor role is returned', doctorLogin.body?.user?.role === 'doctor');
    const doctorToken = doctorLogin.token || doctorLogin.body.token;

    // 6. Role Protection Test: Patient cannot access Doctor queue endpoints
    console.log('\n--- 4. Testing Role-Based API Protection ---');
    const forbiddenCall = await makeRequest('/api/queue/doc-1/call-next', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert('Patient forbidden from calling doctor queue action (403)', forbiddenCall.status === 403);

    // 7. Location-Based Doctor Search
    console.log('\n--- 5. Testing Multi-City Doctor Directory ---');
    const locRes = await makeRequest('/api/locations');
    assert('GET /api/locations returns 5 cities', locRes.status === 200 && locRes.body?.count === 5);

    const chennaiDocs = await makeRequest('/api/doctors?location=Chennai');
    assert('GET /api/doctors?location=Chennai returns multiple Chennai doctors', 
      chennaiDocs.status === 200 && chennaiDocs.body?.count >= 4
    );

    const bangaloreDerm = await makeRequest('/api/doctors?location=Bangalore&specialty=Dermatology');
    assert('GET /api/doctors?location=Bangalore&specialty=Dermatology returns Bangalore Dermatologist',
      bangaloreDerm.status === 200 && bangaloreDerm.body?.count >= 1
    );

    // 8. Appointment Booking & Live Queue Token Assignment
    console.log('\n--- 6. Testing Appointment Booking & Live Queue ---');
    const bookRes = await makeRequest('/api/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` }
    }, {
      doctorId: 'doc-1',
      date: '2026-10-05',
      time: '04:00 PM',
      consultationType: 'In-Clinic',
      reason: 'Hypertension evaluation and chest tightness'
    });
    assert('POST /api/appointments returns 201 Created', bookRes.status === 201);
    assert('Appointment assigned queue token (e.g., Q-04)', Boolean(bookRes.body?.tokenNumber));
    const createdAptId = bookRes.body?.data?.id;

    // 9. Doctor Queue Action: Call Next Patient
    console.log('\n--- 7. Testing Doctor Queue Actions & Status Transitions ---');
    const callNextRes = await makeRequest('/api/queue/doc-1/call-next', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    assert('Doctor calls next patient returns 200', callNextRes.status === 200);
    assert('Called patient queue state is CALLED', callNextRes.body?.calledPatient?.queueState === 'CALLED');

    // 10. Doctor Complete Consultation & Auto-Generated Report
    console.log('\n--- 8. Testing Consultation Completion & Structured Report ---');
    const completeRes = await makeRequest('/api/queue/doc-1/complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` }
    }, {
      appointmentId: createdAptId,
      doctorNotes: 'Patient BP 130/84. Heart sounds normal. Prescribed medication adjustment.',
      clinicalSummary: 'Essential Hypertension Stage 1. Responsive to Telmisartan therapy.',
      advice: 'Low sodium diet, 30 min brisk walk daily, plenty of hydration.',
      followUpDate: '2026-11-05',
      followUpReason: 'Routine 1-month blood pressure review'
    });
    assert('Doctor complete consultation returns 200', completeRes.status === 200);

    // 11. Consultation Reports List & PDF Streaming
    console.log('\n--- 9. Testing Consultation Reports & PDF Download ---');
    const reportsRes = await makeRequest('/api/consultations/reports', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert('Patient can retrieve consultation reports (200)', reportsRes.status === 200 && reportsRes.body?.count >= 1);
    const reportId = reportsRes.body?.data[0]?.id;

    const pdfRes = await makeRequest(`/api/consultations/reports/${reportId}/pdf`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert('GET /api/consultations/reports/:id/pdf returns 200 OK', pdfRes.status === 200);
    assert('PDF response Content-Type is application/pdf', pdfRes.headers['content-type']?.includes('application/pdf'));
    assert('PDF binary size > 1000 bytes', pdfRes.buffer?.length > 1000);

    // 12. Persistent Notification Center
    console.log('\n--- 10. Testing Persistent Notification Center ---');
    const notifsRes = await makeRequest('/api/notifications', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert('GET /api/notifications returns user notifications (200)', notifsRes.status === 200 && notifsRes.body?.count > 0);

    const markAllRes = await makeRequest('/api/notifications/mark-all-read', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert('PATCH /api/notifications/mark-all-read returns 200', markAllRes.status === 200);

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
