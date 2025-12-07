const transporter = require("../config/mailer");

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"My Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });
}

module.exports = sendVerificationEmail;
