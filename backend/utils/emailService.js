const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

// ✅ FORCE IPv4 Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // 🔥 FORCE IPv4
});

// Debug
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ EMAIL ERROR:", err.message);
  } else {
    console.log("✅ EMAIL SERVER READY");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"DocMeet" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};

const sendOtpEmail = (toEmail, otp, name) => {
  return sendEmail({
    to: toEmail,
    subject: "DocMeet OTP",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });
};

module.exports = { sendOtpEmail };