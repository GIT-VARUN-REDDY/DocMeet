const https = require("https");

// ✅ Resend API — works on Render free tier (uses HTTPS port 443)
// Get free API key at resend.com → API Keys → Create Key
// Add RESEND_API_KEY to your .env and Render environment variables

const sendEmail = ({ to, subject, html }) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      from: "DocMeet <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`✅ Email sent to ${to}`);
              resolve(parsed);
            } else {
              console.error("❌ Resend error:", parsed);
              reject(new Error(parsed.message || "Email send failed"));
            }
          } catch (e) {
            reject(new Error("Failed to parse Resend response"));
          }
        });
      }
    );

    req.on("error", (e) => {
      console.error("❌ Resend request error:", e.message);
      reject(e);
    });

    req.write(body);
    req.end();
  });
};

const sendOtpEmail = (toEmail, otp, name) =>
  sendEmail({
    to: toEmail,
    subject: "Your DocMeet Verification Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="color:#2563eb;">🩺 DocMeet</h2>
        <h3 style="color:#111827;">Email Verification</h3>
        <p style="color:#6b7280;">Hi <strong>${name}</strong>, your OTP expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;background:#eff6ff;padding:16px 32px;border-radius:12px;display:inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color:#9ca3af;font-size:13px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

const sendBookingConfirmation = (toEmail, patientName, doctorName, date, time) =>
  sendEmail({
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

module.exports = { sendOtpEmail, sendBookingConfirmation };