const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_USER, // must be verified in SendGrid
      subject,
      html,
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
    throw err;
  }
};

const sendOtpEmail = (toEmail, otp, name) => {
  return sendEmail({
    to: toEmail,
    subject: "DocMeet OTP",
    html: `
      <h2>Hello ${name}</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes</p>
    `,
  });
};

module.exports = { sendOtpEmail };