const http = require('http');

function makeRequest({ method, path, headers = {}, body = null }) {
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
  console.log('🔐 MEDIFLOW COMPREHENSIVE AUTHENTICATION TEST SUITE');
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

  // Case A: Random email + random password
  console.log('--- 1. Testing Case A: Random Email & Password ---');
  const resA = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'random12345@example.com', password: 'anything' }
  });
  assert(resA.statusCode === 401, 'Case A returns HTTP 401', `Got ${resA.statusCode}`);
  assert(resA.data.success === false, 'Case A success is false', JSON.stringify(resA.data));
  assert(resA.data.message === 'Invalid email or password', 'Case A message is "Invalid email or password"');

  // Case B: Correct email, wrong password
  console.log('\n--- 2. Testing Case B: Correct Email, Wrong Password ---');
  const resB = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'patient@mediflow.demo', password: 'WrongPassword123' }
  });
  assert(resB.statusCode === 401, 'Case B returns HTTP 401', `Got ${resB.statusCode}`);
  assert(resB.data.success === false, 'Case B success is false', JSON.stringify(resB.data));
  assert(resB.data.message === 'Invalid email or password', 'Case B message is "Invalid email or password"');

  // Case C: Wrong email, correct-looking password
  console.log('\n--- 3. Testing Case C: Wrong Email, Correct Password ---');
  const resC = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'wrong123@email.com', password: 'Patient@123' }
  });
  assert(resC.statusCode === 401, 'Case C returns HTTP 401', `Got ${resC.statusCode}`);
  assert(resC.data.success === false, 'Case C success is false', JSON.stringify(resC.data));

  // Case D: Correct patient credentials
  console.log('\n--- 4. Testing Case D: Correct Patient Credentials ---');
  const resD = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'patient@mediflow.demo', password: 'Patient@123', requestedRole: 'patient' }
  });
  assert(resD.statusCode === 200, 'Case D returns HTTP 200', `Got ${resD.statusCode}`);
  assert(resD.data.success === true, 'Case D success is true', JSON.stringify(resD.data));
  assert(resD.data.user.role === 'patient', 'Case D user role is patient');
  assert(resD.data.user.email === 'patient@mediflow.demo', 'Case D user email matches');
  assert(!resD.data.user.passwordHash, 'Case D password hash is NOT exposed');
  const patientCookie = resD.headers['set-cookie'] ? resD.headers['set-cookie'][0] : null;
  assert(patientCookie && patientCookie.includes('token='), 'Case D sets HTTP-only auth cookie');

  // Case E: Correct doctor credentials
  console.log('\n--- 5. Testing Case E: Correct Doctor Credentials ---');
  const resE = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'doctor@mediflow.demo', password: 'Doctor@123', requestedRole: 'doctor' }
  });
  assert(resE.statusCode === 200, 'Case E returns HTTP 200', `Got ${resE.statusCode}`);
  assert(resE.data.success === true, 'Case E success is true', JSON.stringify(resE.data));
  assert(resE.data.user.role === 'doctor', 'Case E user role is doctor');
  assert(resE.data.doctor && resE.data.doctor.id === 'doc-1', 'Case E doctor data populated');

  // Case F: Wrong doctor password
  console.log('\n--- 6. Testing Case F: Wrong Doctor Password ---');
  const resF = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'doctor@mediflow.demo', password: 'WrongDoctorPassword123' }
  });
  assert(resF.statusCode === 401, 'Case F returns HTTP 401', `Got ${resF.statusCode}`);
  assert(resF.data.success === false, 'Case F success is false');

  // Case G: Role mismatch protection
  console.log('\n--- 7. Testing Case G: Role Mismatch Protection ---');
  const resG = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'patient@mediflow.demo', password: 'Patient@123', requestedRole: 'doctor' }
  });
  assert(resG.statusCode === 403, 'Case G returns HTTP 403 Forbidden for role mismatch', `Got ${resG.statusCode}`);

  // Case H: Session Verification with Cookie
  console.log('\n--- 8. Testing Case H: Session Verification & Logout ---');
  const rawTokenCookie = patientCookie.split(';')[0];
  const resMeAuth = await makeRequest({
    method: 'GET',
    path: '/api/auth/me',
    headers: { 'Cookie': rawTokenCookie }
  });
  assert(resMeAuth.statusCode === 200, 'GET /api/auth/me with cookie returns 200 OK');
  assert(resMeAuth.data.user.email === 'patient@mediflow.demo', 'Session user restored correctly');

  // Logout
  const resLogout = await makeRequest({
    method: 'POST',
    path: '/api/auth/logout',
    headers: { 'Cookie': rawTokenCookie }
  });
  assert(resLogout.statusCode === 200, 'POST /api/auth/logout returns 200 OK');
  const clearedCookie = resLogout.headers['set-cookie'] ? resLogout.headers['set-cookie'][0] : '';
  assert(clearedCookie.includes('token=;'), 'Logout clears authentication cookie');

  // Check unauthenticated /api/auth/me
  const resMeUnauth = await makeRequest({
    method: 'GET',
    path: '/api/auth/me'
  });
  assert(resMeUnauth.statusCode === 401, 'GET /api/auth/me without cookie returns 401 Unauthorized');

  // Protected route check
  const resProtected = await makeRequest({
    method: 'GET',
    path: '/api/appointments'
  });
  assert(resProtected.statusCode === 401, 'Protected route /api/appointments returns 401 Unauthorized without session');

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
