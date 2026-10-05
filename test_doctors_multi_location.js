const http = require('http');

function makeRequest({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🏥 MEDIFLOW MULTI-DOCTOR & LOCATION DISCOVERY TEST SUITE');
  console.log('========================================================\n');

  // Reset seed data for idempotent testing
  try {
    await makeRequest({ method: 'POST', path: '/api/demo/reset' });
  } catch (e) {}

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

  // 1. Total Doctors
  console.log('--- 1. Testing Total Doctors Dataset ---');
  const resAll = await makeRequest({ path: '/api/doctors' });
  assert(resAll.statusCode === 200, 'GET /api/doctors returns 200');
  assert(resAll.data.count >= 60, `Total doctors count is ${resAll.data.count} (Expected >= 60)`);

  // 2. City Filter Tests
  console.log('\n--- 2. Testing Location-Based Filtering ---');
  const cities = ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Madurai'];
  const cityCounts = {};

  for (const city of cities) {
    const res = await makeRequest({ path: `/api/doctors?location=${city}` });
    assert(res.statusCode === 200, `GET /api/doctors?location=${city} returns 200`);
    assert(res.data.count >= 10, `${city} has ${res.data.count} doctors (Expected >= 10)`);
    cityCounts[city] = res.data.count;
    // Check all returned doctors belong to this city
    const allMatch = res.data.data.every(d => d.location.toLowerCase() === city.toLowerCase());
    assert(allMatch, `All returned doctors are located in ${city}`);
  }

  // 3. Specialty Filter Tests per City
  console.log('\n--- 3. Testing Multiple Doctors per Specialty per City ---');
  const specialties = ['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'ENT'];

  for (const city of ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Madurai']) {
    for (const spec of specialties) {
      const res = await makeRequest({ path: `/api/doctors?location=${city}&specialty=${spec}` });
      assert(res.statusCode === 200, `${city} + ${spec} returns 200`);
      assert(res.data.count >= 2, `${city} + ${spec} has ${res.data.count} doctors (Expected >= 2): ${res.data.data.map(d => d.name).join(', ')}`);
    }
  }

  // 4. Combined Search Tests
  console.log('\n--- 4. Testing Free-text Search ---');
  const searchPriya = await makeRequest({ path: '/api/doctors?search=Priya' });
  assert(searchPriya.data.count >= 2, `Search "Priya" returns ${searchPriya.data.count} doctors (Expected >= 2)`);

  const searchIndiranagar = await makeRequest({ path: '/api/doctors?search=Indiranagar' });
  assert(searchIndiranagar.data.count >= 1, `Search "Indiranagar" returns ${searchIndiranagar.data.count} doctor in Indiranagar`);

  const searchCardio = await makeRequest({ path: '/api/doctors?search=Cardiology' });
  assert(searchCardio.data.count >= 10, `Search "Cardiology" returns ${searchCardio.data.count} cardiology specialists across cities`);

  // 5. Distinct Doctor Profiles & Details
  console.log('\n--- 5. Testing Distinct Doctor Profiles ---');
  const doc1 = await makeRequest({ path: '/api/doctors/doc-1' });
  assert(doc1.data.data.name === 'Dr. Priya Sharma', 'doc-1 is Dr. Priya Sharma');
  assert(doc1.data.data.location === 'Chennai', 'doc-1 is in Chennai');

  const doc2 = await makeRequest({ path: '/api/doctors/doc-2' });
  assert(doc2.data.data.name === 'Dr. Arun Kumar', 'doc-2 is Dr. Arun Kumar');
  assert(doc2.data.data.location === 'Chennai', 'doc-2 is in Chennai');

  const doc17 = await makeRequest({ path: '/api/doctors/doc-17' });
  assert(doc17.data.data.name === 'Dr. Karthik Sundaram', 'doc-17 is Dr. Karthik Sundaram');
  assert(doc17.data.data.location === 'Bangalore', 'doc-17 is in Bangalore');

  const doc33 = await makeRequest({ path: '/api/doctors/doc-33' });
  assert(doc33.data.data.name === 'Dr. Ramesh Reddy', 'doc-33 is Dr. Ramesh Reddy');
  assert(doc33.data.data.location === 'Hyderabad', 'doc-33 is in Hyderabad');

  const doc51 = await makeRequest({ path: '/api/doctors/doc-51' });
  assert(doc51.data.data.name === 'Dr. Rajesh Nair', 'doc-51 is Dr. Rajesh Nair');
  assert(doc51.data.data.location === 'Coimbatore', 'doc-51 is in Coimbatore');

  const doc59 = await makeRequest({ path: '/api/doctors/doc-59' });
  assert(doc59.data.data.name === 'Dr. R. Muthukumar', 'doc-59 is Dr. R. Muthukumar');
  assert(doc59.data.data.location === 'Madurai', 'doc-59 is in Madurai');

  // 6. Separate Queues per Doctor
  console.log('\n--- 6. Testing Separate Queues per Doctor ---');
  const queue1 = await makeRequest({ path: '/api/queue/doc-1' });
  const queue2 = await makeRequest({ path: '/api/queue/doc-2' });
  const queue17 = await makeRequest({ path: '/api/queue/doc-17' });

  assert(queue1.statusCode === 200, 'GET /api/queue/doc-1 returns 200');
  assert(queue1.data.data.doctorName === 'Dr. Priya Sharma', 'Queue 1 belongs to Dr. Priya Sharma');
  assert(queue1.data.data.waitingCount === 2, `Dr. Priya Sharma waiting count is ${queue1.data.data.waitingCount}`);

  assert(queue2.statusCode === 200, 'GET /api/queue/doc-2 returns 200');
  assert(queue2.data.data.doctorName === 'Dr. Arun Kumar', 'Queue 2 belongs to Dr. Arun Kumar');
  assert(queue2.data.data.waitingCount === 1, `Dr. Arun Kumar waiting count is ${queue2.data.data.waitingCount}`);

  assert(queue17.statusCode === 200, 'GET /api/queue/doc-17 returns 200');
  assert(queue17.data.data.doctorName === 'Dr. Karthik Sundaram', 'Queue 17 belongs to Dr. Karthik Sundaram');
  assert(queue17.data.data.waitingCount === 2, `Dr. Karthik Sundaram waiting count is ${queue17.data.data.waitingCount}`);

  // 7. Booking with specific doctor
  console.log('\n--- 7. Testing Booking with Doctor ID ---');
  const loginRes = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'patient@mediflow.demo', password: 'Patient@123', requestedRole: 'patient' }
  });
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';

  const bookingRes = await makeRequest({
    method: 'POST',
    path: '/api/appointments',
    headers: { 'Cookie': cookie },
    body: {
      doctorId: 'doc-2',
      patientName: 'Rahul Sharma',
      date: '2026-10-05',
      time: '04:15 PM',
      consultationType: 'In-Clinic',
      reason: 'Heart checkup with Dr. Arun Kumar'
    }
  });

  assert(bookingRes.statusCode === 201, 'Booking returns 201 Created');
  assert(bookingRes.data.data.doctorId === 'doc-2', 'Booked appointment has doctorId doc-2');
  assert(bookingRes.data.data.doctorName === 'Dr. Arun Kumar', 'Booked appointment has doctorName Dr. Arun Kumar');

  // Verify Dr. Arun Kumar queue updated and Dr. Priya Sharma queue unchanged
  const queue2After = await makeRequest({ path: '/api/queue/doc-2' });
  assert(queue2After.data.data.waitingCount === 2, `Dr. Arun Kumar queue updated to ${queue2After.data.data.waitingCount} patients`);

  const queue1After = await makeRequest({ path: '/api/queue/doc-1' });
  assert(queue1After.data.data.waitingCount === 2, `Dr. Priya Sharma queue remained at ${queue1After.data.data.waitingCount} patients`);

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
