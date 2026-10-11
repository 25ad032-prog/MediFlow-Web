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

async function runRecoveryTests() {
  console.log('================================================================');
  console.log('🔐 MEDIFLOW WEB PASSWORD RECOVERY & RECOVERY SECURITY TEST SUITE');
  console.log('================================================================\n');

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
    // 1. Normal Login Test (Without OTP)
    console.log('--- 1. Testing Normal Login (Untouched, Direct Password Login) ---');
    const normalLoginRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'patient@mediflow.demo', password: 'Patient@123' }
    });
    assert(normalLoginRes.statusCode === 200, 'Normal login succeeds with HTTP 200', `Got ${normalLoginRes.statusCode}`);
    assert(normalLoginRes.data.success === true, 'Normal login success is true', JSON.stringify(normalLoginRes.data));
    assert(Boolean(normalLoginRes.data.token), 'Normal login issues valid JWT token');
    const originalToken = normalLoginRes.data.token;

    // 2. Generic Response on Non-Existent Email (No User Enumeration)
    console.log('\n--- 2. Testing Email Enumeration Defense ---');
    const nonExistentRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/forgot-password',
      body: { email: 'nonexistent-user-12345@domain.com' }
    });
    assert(nonExistentRes.statusCode === 200, 'Non-existent email returns HTTP 200 to prevent enumeration');
    assert(nonExistentRes.data.success === true, 'Response reports generic success');
    assert(nonExistentRes.data.message.includes('verification code has been sent'), 'Generic message displayed');
    assert(!nonExistentRes.data.devOtp, 'No OTP issued for non-existent email');

    // 3. Request Password Reset for Registered Patient
    console.log('\n--- 3. Testing Valid Password Reset Request ---');
    const testEmail = 'patient@mediflow.demo';
    const forgotRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/forgot-password',
      body: { email: testEmail }
    });
    assert(forgotRes.statusCode === 200, 'Password reset request returns HTTP 200');
    assert(forgotRes.data.success === true, 'Reset request marked successful');
    const devOtp = forgotRes.data.devOtp;
    assert(Boolean(devOtp) && /^\d{6}$/.test(devOtp), `Valid 6-digit OTP code generated (dev: ${devOtp})`);

    // 4. Rate Limiting Enforcement (Exceeding max requests in 15 minutes)
    console.log('\n--- 4. Testing Rate Limiting on Forgot Password (Max 3 per 15 min) ---');
    // Send 3 more requests rapidly
    await makeRequest({ method: 'POST', path: '/api/auth/forgot-password', body: { email: testEmail } });
    await makeRequest({ method: 'POST', path: '/api/auth/forgot-password', body: { email: testEmail } });
    const rateLimitedRes = await makeRequest({ method: 'POST', path: '/api/auth/forgot-password', body: { email: testEmail } });
    assert(rateLimitedRes.statusCode === 429, 'Excessive recovery requests blocked with HTTP 429', `Got ${rateLimitedRes.statusCode}`);
    assert(rateLimitedRes.data.success === false, 'Rate limited response has success: false');

    // 5. Invalid OTP Verification & Attempt Tracking
    console.log('\n--- 5. Testing Invalid OTP Rejection & Attempt Limits ---');
    const invalidOtpRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/verify-otp',
      body: { email: testEmail, otp: '000000' }
    });
    assert(invalidOtpRes.statusCode === 400, 'Invalid OTP returns HTTP 400');
    assert(invalidOtpRes.data.success === false, 'Invalid OTP success is false');
    assert(invalidOtpRes.data.message.includes('remaining') || invalidOtpRes.data.message.includes('Invalid'), 'Attempt counter feedback provided');

    // 6. Valid OTP Verification & Reset Token Issuance
    console.log('\n--- 6. Testing Valid OTP Verification & Token Binding ---');
    // Get latest active OTP for testEmail
    const freshForgotRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/forgot-password',
      body: { email: 'doctor@mediflow.demo' }
    });
    const docOtp = freshForgotRes.data.devOtp;
    const verifyDocRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/verify-otp',
      body: { email: 'doctor@mediflow.demo', otp: docOtp }
    });
    assert(verifyDocRes.statusCode === 200, 'Valid OTP returns HTTP 200');
    assert(verifyDocRes.data.success === true, 'Verification success is true');
    assert(Boolean(verifyDocRes.data.resetToken), 'Issued single-use resetToken');
    const docResetToken = verifyDocRes.data.resetToken;

    // 7. Reset Token Binding (Preventing Token Use on Different Email)
    console.log('\n--- 7. Testing Reset Token Email Binding Security ---');
    const crossEmailRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { email: 'attacker@example.com', resetToken: docResetToken, newPassword: 'NewDoctorPassword@123' }
    });
    assert(crossEmailRes.statusCode === 400, 'Using reset token on mismatched email is blocked (HTTP 400)');

    // 8. Password Strength Validation (< 6 characters)
    console.log('\n--- 8. Testing Password Policy Enforcement ---');
    const weakPwRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { email: 'doctor@mediflow.demo', resetToken: docResetToken, newPassword: '123' }
    });
    assert(weakPwRes.statusCode === 400, 'Short password (< 6 chars) rejected with HTTP 400');

    // 9. Successful Password Reset
    console.log('\n--- 9. Testing Successful Password Reset ---');
    const newDocPassword = 'DoctorNewPassword@2026';
    const resetSuccessRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { email: 'doctor@mediflow.demo', resetToken: docResetToken, newPassword: newDocPassword }
    });
    assert(resetSuccessRes.statusCode === 200, 'Password reset succeeds with HTTP 200');
    assert(resetSuccessRes.data.success === true, 'Password reset reported as success');

    // 10. Single-Use Enforcement (Reusing the Same Token Fails)
    console.log('\n--- 10. Testing Single-Use Enforcement (Token Invalidation) ---');
    const reuseTokenRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { email: 'doctor@mediflow.demo', resetToken: docResetToken, newPassword: 'AnotherPassword@123' }
    });
    assert(reuseTokenRes.statusCode === 400, 'Reusing an already consumed reset token is rejected (HTTP 400)');

    // 11. Old Password Must Fail Login
    console.log('\n--- 11. Testing Old Password Rejection ---');
    const oldLoginRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'doctor@mediflow.demo', password: 'Doctor@123' }
    });
    assert(oldLoginRes.statusCode === 401, 'Old password fails authentication with HTTP 401');

    // 12. New Password Must Succeed Login
    console.log('\n--- 12. Testing Login with New Password ---');
    const newLoginRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'doctor@mediflow.demo', password: newDocPassword }
    });
    assert(newLoginRes.statusCode === 200, 'New password logs in successfully with HTTP 200');
    assert(newLoginRes.data.success === true, 'New login success is true');
    assert(newLoginRes.data.user.email === 'doctor@mediflow.demo', 'Authenticated as correct doctor user');

    // Reset doctor password back to Doctor@123 for test environment idempotence
    const cleanupForgot = await makeRequest({
      method: 'POST',
      path: '/api/auth/forgot-password',
      body: { email: 'doctor@mediflow.demo' }
    });
    if (cleanupForgot.data.devOtp) {
      const cleanupVerify = await makeRequest({
        method: 'POST',
        path: '/api/auth/verify-otp',
        body: { email: 'doctor@mediflow.demo', otp: cleanupForgot.data.devOtp }
      });
      if (cleanupVerify.data.resetToken) {
        await makeRequest({
          method: 'POST',
          path: '/api/auth/reset-password',
          body: { email: 'doctor@mediflow.demo', resetToken: cleanupVerify.data.resetToken, newPassword: 'Doctor@123' }
        });
      }
    }

    // 13. Authenticated Change Password Endpoint
    console.log('\n--- 13. Testing Authenticated /api/auth/change-password ---');
    // First login as patient
    const patientLogin = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'patient@mediflow.demo', password: 'Patient@123' }
    });
    const pToken = patientLogin.data.token;

    // Try change password with wrong current password
    const wrongCurrentRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/change-password',
      headers: { Authorization: `Bearer ${pToken}` },
      body: { currentPassword: 'WrongPassword', newPassword: 'PatientNew@123' }
    });
    assert(wrongCurrentRes.statusCode === 400, 'Wrong current password returns HTTP 400');

    // Change password with correct current password
    const changeSuccessRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/change-password',
      headers: { Authorization: `Bearer ${pToken}` },
      body: { currentPassword: 'Patient@123', newPassword: 'PatientUpdated@123' }
    });
    assert(changeSuccessRes.statusCode === 200, 'Change password succeeds with HTTP 200');
    assert(changeSuccessRes.data.success === true, 'Change password success is true');
    assert(Boolean(changeSuccessRes.data.token), 'Returns fresh active token');

    // Change back for idempotence
    await makeRequest({
      method: 'POST',
      path: '/api/auth/change-password',
      headers: { Authorization: `Bearer ${changeSuccessRes.data.token}` },
      body: { currentPassword: 'PatientUpdated@123', newPassword: 'Patient@123' }
    });

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRecoveryTests();
