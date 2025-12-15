const transporter = require("../config/mailer");

async function sendVerificationEmail(email, otp) {
  await transporter.sendMail({
    from: `"My Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Email Verification Code",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 3px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}

module.exports = sendVerificationEmail;
