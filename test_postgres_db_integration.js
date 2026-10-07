const { dbService, checkConnection, hasDbConfig, isDbConnected } = require('./server/db');

async function testPostgreSqlIntegration() {
  console.log('========================================================');
  console.log('🐘 MEDIFLOW POSTGRESQL DATABASE & REPOSITORY TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Check Connection / Mode Status
    console.log('1. Database Connection & Environment Detection Status');
    const hasConfig = hasDbConfig();
    assert(typeof hasConfig === 'boolean', `hasDbConfig() detects env status (configured: ${hasConfig})`);

    const conn = await checkConnection();
    console.log(`   Connected: ${conn.connected} | Configured: ${conn.configured} (${conn.connected ? `DB: ${conn.database}` : conn.reason || conn.error})`);
    assert(typeof conn.connected === 'boolean', 'checkConnection returns valid status object');
    assert(typeof conn.configured === 'boolean', 'checkConnection includes configured flag');

    // 2. Multi-City Doctors Dataset
    console.log('\n2. Multi-City Doctor Repository Verification');
    const allDoctors = await dbService.getDoctors();
    assert(allDoctors.length === 70, `Loads all 70 doctors (found: ${allDoctors.length})`);

    const chennaiDocs = await dbService.getDoctors({ location: 'Chennai' });
    assert(chennaiDocs.length > 0 && chennaiDocs.every(d => d.city === 'Chennai'), `Filtered Chennai doctors (count: ${chennaiDocs.length})`);

    const cardioDocs = await dbService.getDoctors({ specialty: 'Cardiologist' });
    assert(cardioDocs.length > 0, `Filtered Cardiology doctors (count: ${cardioDocs.length})`);

    const doc1 = await dbService.getDoctorById('doc-1');
    assert(doc1 && doc1.name === 'Dr. Priya Sharma', `Retrieved Dr. Priya Sharma by ID: ${doc1?.name}`);

    // 3. User Authentication Persistence
    console.log('\n3. User Authentication Queries');
    const patientUser = await dbService.findUserByEmailOrPhone('patient@mediflow.demo');
    assert(patientUser && patientUser.role === 'patient', `Found demo patient user: ${patientUser?.email}`);

    const doctorUser = await dbService.findUserByEmailOrPhone('doctor@mediflow.demo');
    assert(doctorUser && doctorUser.role === 'doctor', `Found demo doctor user: ${doctorUser?.email}`);

    // 4. Locations
    console.log('\n4. Locations Repository');
    const locations = await dbService.getLocations();
    assert(locations.length === 5, `Loads all 5 hub locations (found: ${locations.length})`);

    // 5. Patient Profile
    console.log('\n5. Patient Profile Repository');
    const profile = await dbService.getPatientProfile('pat-1');
    assert(profile && profile.name === 'Rahul Sharma', `Loaded profile for: ${profile?.name}`);

    // 6. Appointments & Live Queue
    console.log('\n6. Appointments & Queue Operations');
    const apts = await dbService.getAppointments({ doctorId: 'doc-1' });
    assert(apts.length > 0, `Found ${apts.length} appointments for Dr. Priya Sharma`);

    const testAptId = `test-apt-${Date.now()}`;
    const createdApt = await dbService.createAppointment({
      id: testAptId,
      tokenNumber: 'Q-99',
      doctorId: 'doc-1',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialty: 'Cardiologist',
      patientId: 'pat-1',
      patientName: 'Rahul Sharma',
      date: '2026-10-05',
      time: '05:30 PM',
      status: 'waiting',
      queuePosition: 99
    });
    assert(createdApt && createdApt.id === testAptId, `Created appointment: ${createdApt?.id}`);

    const fetchedApt = await dbService.getAppointmentById(testAptId);
    assert(fetchedApt && fetchedApt.tokenNumber === 'Q-99', `Fetched created appointment token: ${fetchedApt?.tokenNumber}`);

    // 7. Consultation Reports
    console.log('\n7. Consultation Reports Repository');
    const reports = await dbService.getConsultationReports({ patientId: 'pat-1' });
    assert(reports.length > 0, `Found ${reports.length} consultation reports for patient`);

    // 8. Notifications
    console.log('\n8. Notifications Repository');
    const notifs = await dbService.getNotifications('usr-patient-1', 'pat-1');
    assert(notifs.length > 0, `Found ${notifs.length} notifications`);

    // 9. Family Members & Vault
    console.log('\n9. Family & Medical Documents');
    const family = await dbService.getFamilyMembers('pat-1');
    assert(family.length > 0, `Found ${family.length} family members`);

    const docs = await dbService.getMedicalDocuments('pat-1');
    assert(docs.length > 0, `Found ${docs.length} medical documents`);

    console.log('\n========================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

testPostgreSqlIntegration();
