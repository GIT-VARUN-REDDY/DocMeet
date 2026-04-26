const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP email
const sendOtpEmail = async (toEmail, otp, name) => {
  await transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your DocMeet Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">🩺 DocMeet</h2>
        <h3 style="color: #111827;">Email Verification</h3>
        <p style="color: #6b7280;">Hi <strong>${name}</strong>, use the OTP below to verify your email. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #2563eb; background: #eff6ff; padding: 16px 32px; border-radius: 12px;">
            ${otp}
          </span>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

// Send booking confirmation to patient
const sendBookingConfirmation = async (toEmail, patientName, doctorName, date, time) => {
  await transporter.sendMail({
    from: `"DocMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Confirmed - DocMeet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #2563eb;">🩺 DocMeet</h2>
        <h3 style="color: #111827;">Appointment Confirmed ✅</h3>
        <p style="color: #6b7280;">Hi <strong>${patientName}</strong>, your appointment is confirmed!</p>
        <div style="background: #f0fdf4; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #111827;">👨‍⚕️ <strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 4px 0; color: #111827;">📅 <strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0; color: #111827;">🕐 <strong>Time:</strong> ${time}</p>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">Please arrive 10 minutes early. You can cancel from your DocMeet account.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail, sendBookingConfirmation };