const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email server connection successful');
  } catch (error) {
    console.error('Email server connection failed:', error.message);
  }
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Reserve Music" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Reserve Music Password',
    text: `You requested a password reset. Click this link to reset your password: ${resetLink}

This link expires in 30 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your Reserve Music password.</p>
      <p><a href="${resetLink}">Reset My Password</a></p>
      <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
    `,
  });
}

module.exports = {
  transporter,
  verifyEmailConnection,
  generateToken,
  hashToken,
  sendPasswordResetEmail,
};