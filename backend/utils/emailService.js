const nodemailer = require("nodemailer");

// Create transporter once
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // ✅ fixes Render SSL issues
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  console.log(`📧 Sending email to ${to}...`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`   EMAIL_PASS set: ${!!process.env.EMAIL_PASS}`);

  const info = await transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`✅ Email sent: ${info.messageId}`);
  return info;
};

// Send OTP email
const sendOtpEmail = (toEmail, otp, name) => {
  return sendEmail({
    to: toEmail,
    subject: "Your DocMeet Verification Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3 style="color:#111827;">Email Verification</h3>
        <p style="color:#6b7280;">Hi <strong>${name}</strong>, use the OTP below to verify your email. Expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;background:#eff6ff;padding:16px 32px;border-radius:12px;display:inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color:#9ca3af;font-size:13px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

// Send booking confirmation
const sendBookingConfirmation = (toEmail, patientName, doctorName, date, time) => {
  return sendEmail({
    to: toEmail,
    subject: "Appointment Confirmed - DocMeet",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3 style="color:#111827;">Appointment Confirmed ✅</h3>
        <p style="color:#6b7280;">Hi <strong>${patientName}</strong>, your appointment is confirmed!</p>
        <div style="background:#f0fdf4;border-radius:10px;padding:20px;margin:20px 0;">
          <p style="margin:4px 0;color:#111827;">👨‍⚕️ <strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin:4px 0;color:#111827;">📅 <strong>Date:</strong> ${date}</p>
          <p style="margin:4px 0;color:#111827;">🕐 <strong>Time:</strong> ${time}</p>
        </div>
        <p style="color:#9ca3af;font-size:13px;">Please arrive 10 minutes early.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail, sendBookingConfirmation };