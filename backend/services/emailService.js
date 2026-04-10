const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, purpose) {
  const isSignup = purpose === 'signup';
  const subject  = isSignup ? 'Verify your StructGuru account' : 'Your StructGuru login code';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0c0f;color:#e6edf3;border-radius:12px;overflow:hidden;border:1px solid #21262d;">
      <div style="background:#111418;padding:28px 32px;border-bottom:1px solid #21262d;">
        <h2 style="margin:0;font-size:20px;color:#e6edf3;letter-spacing:-0.02em;">StructGuru</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#8b949e;">Structural Engineering Tools</p>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 8px;font-size:15px;color:#8b949e;">
          ${isSignup ? 'Thanks for signing up! Use this code to verify your email:' : 'Use this code to complete your login:'}
        </p>
        <div style="background:#161b22;border:1px solid #21262d;border-radius:8px;padding:24px;text-align:center;margin:20px 0;">
          <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;letter-spacing:0.15em;color:#388bfd;">
            ${otp}
          </span>
        </div>
        <p style="margin:0;font-size:13px;color:#484f58;">
          This code expires in <strong style="color:#8b949e;">10 minutes</strong>.
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"StructGuru" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
}

module.exports = { generateOTP, sendOTPEmail };
