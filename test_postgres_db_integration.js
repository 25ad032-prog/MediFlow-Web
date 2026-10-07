const { dbService, checkConnection, hasDbConfig, isDbConnected } = require('./server/db');
const seedData = require('./server/data/seedData');

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

    // 2. Foreign Key & Dependency Integrity Verification
    console.log('\n2. Foreign Key & Seed Data Referential Integrity');
    const userIds = new Set(seedData.users.map(u => u.id));
    const docIds = new Set(seedData.doctors.map(d => d.id));
    const aptIds = new Set(seedData.appointments.map(a => a.id));

    // Check patient profile -> user
    const profileUserValid = !seedData.patientProfile.userId || userIds.has(seedData.patientProfile.userId);
    assert(profileUserValid, `Patient profile references valid user (${seedData.patientProfile.userId})`);

    // Check all appointments -> doctors
    const allAptsHaveValidDoctor = seedData.appointments.every(a => docIds.has(a.doctorId));
    assert(allAptsHaveValidDoctor, `All ${seedData.appointments.length} appointments reference valid doctor IDs`);

    // Check all consultation reports -> appointments & doctors
    const allReportsHaveValidApt = seedData.consultationReports.every(r => !r.appointmentId || aptIds.has(r.appointmentId));
    assert(allReportsHaveValidApt, `All ${seedData.consultationReports.length} consultation reports reference valid appointment IDs`);

    const allReportsHaveValidDoc = seedData.consultationReports.every(r => docIds.has(r.doctorId));
    assert(allReportsHaveValidDoc, `All ${seedData.consultationReports.length} consultation reports reference valid doctor IDs`);

    // 3. Multi-City Doctors Dataset
    console.log('\n3. Multi-City Doctor Repository Verification');
    const allDoctors = await dbService.getDoctors();
    assert(allDoctors.length === 70, `Loads all 70 doctors (found: ${allDoctors.length})`);

    const chennaiDocs = await dbService.getDoctors({ location: 'Chennai' });
    assert(chennaiDocs.length > 0 && chennaiDocs.every(d => d.city === 'Chennai'), `Filtered Chennai doctors (count: ${chennaiDocs.length})`);

    const cardioDocs = await dbService.getDoctors({ specialty: 'Cardiologist' });
    assert(cardioDocs.length > 0, `Filtered Cardiology doctors (count: ${cardioDocs.length})`);

    const doc1 = await dbService.getDoctorById('doc-1');
    assert(doc1 && doc1.name === 'Dr. Priya Sharma', `Retrieved Dr. Priya Sharma by ID: ${doc1?.name}`);

    // 4. User Authentication Persistence
    console.log('\n4. User Authentication Queries');
    const patientUser = await dbService.findUserByEmailOrPhone('patient@mediflow.demo');
    assert(patientUser && patientUser.role === 'patient', `Found demo patient user: ${patientUser?.email}`);

    const doctorUser = await dbService.findUserByEmailOrPhone('doctor@mediflow.demo');
    assert(doctorUser && doctorUser.role === 'doctor', `Found demo doctor user: ${doctorUser?.email}`);

    // 5. Locations
    console.log('\n5. Locations Repository');
    const locations = await dbService.getLocations();
    assert(locations.length === 5, `Loads all 5 hub locations (found: ${locations.length})`);

    // 6. Patient Profile
    console.log('\n6. Patient Profile Repository');
    const profile = await dbService.getPatientProfile('pat-1');
    assert(profile && profile.name === 'Rahul Sharma', `Loaded profile for: ${profile?.name}`);

    // 7. Appointments & Live Queue
    console.log('\n7. Appointments & Queue Operations');
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

    // 8. Consultation Reports
    console.log('\n8. Consultation Reports Repository');
    const reports = await dbService.getConsultationReports({ patientId: 'pat-1' });
    assert(reports.length > 0, `Found ${reports.length} consultation reports for patient`);

    // 9. Notifications
    console.log('\n9. Notifications Repository');
    const notifs = await dbService.getNotifications('usr-patient-1', 'pat-1');
    assert(notifs.length > 0, `Found ${notifs.length} notifications`);

    // 10. Family Members & Vault
    console.log('\n10. Family & Medical Documents');
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
