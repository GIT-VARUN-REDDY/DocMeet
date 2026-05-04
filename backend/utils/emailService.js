const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");const nodemailer = require("nodemailer");

// ✅ Create ONE transporter globally
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verify once on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ EMAIL ERROR:", error.message);
  } else {
    console.log("✅ EMAIL SERVER READY");
  }
});

// Send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📧 Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"DocMeet" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};

// OTP Email
const sendOtpEmail = (toEmail, otp, name) => {
  return sendEmail({
    to: toEmail,
    subject: "Your DocMeet Verification Code",
    html: `
      <div style="font-family:Arial;">
        <h2>DocMeet OTP</h2>
        <p>Hi ${name}, your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes</p>
      </div>
    `,
  });
};

// Booking Email
const sendBookingConfirmation = (toEmail, patientName, doctorName, date, time) => {
  return sendEmail({
    to: toEmail,
    subject: "Appointment Confirmed",
    html: `
      <h2>Appointment Confirmed</h2>
      <p>${patientName}, your booking with Dr. ${doctorName}</p>
      <p>${date} at ${time}</p>
    `,
  });
};

module.exports = { sendOtpEmail, sendBookingConfirmation };