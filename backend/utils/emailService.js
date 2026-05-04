const nodemailer = require("nodemailer");
const dns = require("dns");

// 🔥 HARD FORCE IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // 🔥 CRITICAL FIX
  connectionTimeout: 10000,
  greetingTimeout: 10000,

  // Force IPv4 at socket level
  tls: {
    rejectUnauthorized: false,
  },

  // 👇 THIS IS THE REAL FIX
  family: 4,
});