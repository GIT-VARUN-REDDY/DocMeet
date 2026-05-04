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

const sendOtpEmail = (toEmail, otp, name) =>
  transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your DocMeet Verification Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3 style="color:#111827;">Email Verification</h3>
        <p style="color:#6b7280;">Hi <strong>${name}</strong>, your OTP expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;background:#eff6ff;padding:16px 32px;border-radius:12px;display:inline-block;">${otp}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px;">If you didn't request this, ignore this email.</p>
      </div>`,
  });

const sendBookingConfirmation = (toEmail, patientName, doctorName, date, time) =>
  transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Confirmed - DocMeet",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3>Appointment Confirmed ✅</h3>
        <p>Hi <strong>${patientName}</strong>, your appointment is confirmed!</p>
        <div style="background:#f0fdf4;border-radius:10px;padding:20px;margin:20px 0;">
          <p>👨‍⚕️ <strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p>📅 <strong>Date:</strong> ${date}</p>
          <p>🕐 <strong>Time:</strong> ${time}</p>
        </div>
        <p style="color:#9ca3af;font-size:13px;">Please arrive 10 minutes early.</p>
      </div>`,
  });

module.exports = { sendOtpEmail, sendBookingConfirmation };