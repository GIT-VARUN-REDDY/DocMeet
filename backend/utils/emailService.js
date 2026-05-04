const nodemailer = require("nodemailer");
const dns = require("dns");

// 🔥 Force IPv4 (fixes ENETUNREACH)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // 🔥 force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

// ✅ OTP EMAIL
const sendOtpEmail = async (toEmail, otp, name) => {
  return await transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your DocMeet Verification Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3>Email Verification</h3>
        <p>Hi <strong>${name}</strong>, your OTP expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:30px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#2563eb;">
            ${otp}
          </span>
        </div>
        <p style="font-size:13px;color:#888;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

// ✅ BOOKING EMAIL
const sendBookingConfirmation = async (toEmail, patientName, doctorName, date, time) => {
  return await transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Confirmed - DocMeet",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3>Appointment Confirmed ✅</h3>
        <p>Hi <strong>${patientName}</strong>, your appointment is confirmed!</p>
        <div style="background:#f0fdf4;padding:20px;border-radius:10px;">
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
      </div>
    `,
  });
};

// 🔥 VERY IMPORTANT EXPORT (fixes your error)
module.exports = {
  sendOtpEmail,
  sendBookingConfirmation,
};