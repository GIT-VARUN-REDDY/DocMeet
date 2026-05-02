// Run: node diagnose.js
require("dotenv").config();
const path = require("path");
const fs = require("fs");

console.log("\n── ENVIRONMENT ──");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ NOT SET");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? `✅ SET (${process.env.EMAIL_PASS.length} chars)` : "❌ NOT SET");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ SET" : "❌ NOT SET");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET");

console.log("\n── FILE STRUCTURE ──");
const files = [
  "./utils/emailService.js",
  "./controllers/authController.js",
  "./middleware/authMiddleware.js",
  "./middleware/validators.js",
  "./models/User.js",
  "./models/Appointment.js",
  "./routes/authRoutes.js",
  "./routes/doctorRoutes.js",
  "./routes/appointmentRoutes.js",
];
files.forEach((f) => {
  const exists = fs.existsSync(path.join(__dirname, f));
  console.log(`${exists ? "✅" : "❌"} ${f}`);
});

console.log("\n── EMAIL TEST ──");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.verify((err, ok) => {
  if (err) {
    console.log("❌ Email connection FAILED:", err.message);
  } else {
    console.log("✅ Email connection OK");
    console.log("\nSending test OTP email...");
    transporter.sendMail({
      from: `"DocMeet" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "DocMeet OTP Test",
      html: "<h2>Your OTP is: <strong>123456</strong></h2>",
    }, (e, info) => {
      if (e) console.log("❌ Send failed:", e.message);
      else console.log("✅ Test OTP email sent! Check inbox/spam at:", process.env.EMAIL_USER);
      process.exit();
    });
  }
});