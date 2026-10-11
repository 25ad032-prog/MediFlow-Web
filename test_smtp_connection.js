require('dotenv').config();
const { isSmtpConfigured, verifySmtpConnection } = require('./server/utils/emailService');

async function testConnection() {
  console.log('====================================================');
  console.log('📧 BREVO SMTP CONFIGURATION & CONNECTIVITY TEST');
  console.log('====================================================\n');

  console.log('1. Checking Environment Variables:');
  console.log(`   SMTP_HOST   : ${process.env.SMTP_HOST || '(not set)'}`);
  console.log(`   SMTP_PORT   : ${process.env.SMTP_PORT || '587'}`);
  console.log(`   SMTP_SECURE : ${process.env.SMTP_SECURE || 'false'}`);
  console.log(`   SMTP_USER   : ${process.env.SMTP_USER ? (process.env.SMTP_USER.includes('YOUR_') ? '⚠️ Still default placeholder' : '✓ Set (' + process.env.SMTP_USER.replace(/(.{3}).*(@.*)/, '$1***$2') + ')') : '❌ Missing'}`);
  console.log(`   SMTP_PASS   : ${process.env.SMTP_PASS ? (process.env.SMTP_PASS.includes('YOUR_') ? '⚠️ Still default placeholder' : '✓ Set (hidden for security)') : '❌ Missing'}`);
  console.log(`   EMAIL_FROM  : ${process.env.EMAIL_FROM || '❌ Missing'}\n`);

  if (!isSmtpConfigured() || (process.env.SMTP_USER && process.env.SMTP_USER.includes('YOUR_')) || (process.env.SMTP_PASS && process.env.SMTP_PASS.includes('YOUR_'))) {
    console.log('❌ Status: Brevo SMTP credentials are not yet entered in .env.');
    console.log('   Please edit .env and replace YOUR_BREVO_LOGIN_HERE, YOUR_BREVO_KEY_HERE, and YOUR_VERIFIED_BREVO_EMAIL_HERE.\n');
    process.exit(1);
  }

  console.log('2. Testing Authentication & Handshake with Brevo Relay...');
  const result = await verifySmtpConnection();

  if (result.success) {
    console.log('✅ PASS: Successfully authenticated and connected to Brevo SMTP server!');
    console.log('   Real OTP emails can now be dispatched securely to external inboxes.\n');
  } else {
    console.error('❌ FAIL: Connection rejected by mail server:');
    console.error(`   ${result.message}\n`);
    console.log('💡 Common Brevo troubleshooting tips:');
    console.log('   1. Ensure SMTP_HOST is smtp-relay.brevo.com');
    console.log('   2. Ensure SMTP_PORT is 587 and SMTP_SECURE is false');
    console.log('   3. Ensure SMTP_USER is the exact login shown under Brevo -> SMTP & API');
    console.log('   4. Ensure SMTP_PASS is the master SMTP key generated in Brevo');

    console.log('   5. Ensure EMAIL_FROM is an authorized/verified sender email in Brevo -> Senders & IP\n');
    process.exit(1);
  }
}

testConnection();
