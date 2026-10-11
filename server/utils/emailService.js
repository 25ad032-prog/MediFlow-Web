const nodemailer = require('nodemailer');

// Build SMTP Transporter from environment variables
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
}

/**
 * Check if real SMTP provider is configured
 */
function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Verify SMTP connection with the configured provider
 */
async function verifySmtpConnection() {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      message: 'SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not set.'
    };
  }
  try {
    await transporter.verify();
    return {
      success: true,
      message: 'SMTP connection established successfully with mail provider.'
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}


/**
 * Send Password Reset OTP Email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.otp - 6-digit verification code
 * @param {string} options.name - Recipient user name
 */
async function sendPasswordResetOtpEmail({ to, otp, name = 'Valued User' }) {
  const from = process.env.EMAIL_FROM || 'MediFlow Security <no-reply@mediflow.io>';
  const transporter = getTransporter();

  // Development fallback: Log OTP to console ONLY in non-production
  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[EmailService] ❌ Real SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are required in production.');
      throw new Error('SMTP service not configured on server.');
    }

    console.log('----------------------------------------------------');
    console.log(`[EmailService - DEV MODE] 📧 Password Reset OTP for: ${to}`);
    console.log(`[EmailService - DEV MODE] 🔑 6-Digit Code: ${otp}`);
    console.log(`[EmailService - DEV MODE] ⏳ Valid for 5 minutes.`);
    console.log('----------------------------------------------------');

    return {
      success: true,
      mode: 'dev-console',
      message: 'OTP generated and logged to development console.'
    };
  }

  // Real SMTP Delivery
  const subject = `MediFlow Security: ${otp} is your password reset code`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MediFlow Password Reset</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0d9488, #0284c7); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 24px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .otp-box { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f766e; font-family: monospace; }
        .badge { display: inline-block; background: #ccfbf1; color: #115e59; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; }
        .warning { font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; }
        .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MediFlow Healthcare</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Secure Patient & Clinical Authentication</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <p>We received a request to reset the password for your MediFlow account associated with <strong>${to}</strong>.</p>
          <p>Please enter the 6-digit verification code below to proceed with resetting your password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="badge">Valid for 5 minutes</div>
          </div>
          <p style="font-size: 13px; color: #475569;">If you didn't ask for this code, someone may have entered your email by mistake. You can safely ignore this email — your account remains completely secure.</p>
          <div class="warning">
            <strong>Security Notice:</strong> MediFlow staff will never ask you for your verification code or password. Never share this code with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} MediFlow Healthcare Platform • All rights reserved
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: `Your MediFlow verification code is: ${otp}. It will expire in 5 minutes.`
  });

  return {
    success: true,
    mode: 'smtp',
    messageId: info.messageId
  };
}

module.exports = {
  isSmtpConfigured,
  verifySmtpConnection,
  sendPasswordResetOtpEmail
};

