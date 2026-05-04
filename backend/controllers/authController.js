const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/emailService");

// 🔐 TOKEN
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// 🔢 OTP
const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

// 🔥 SAFE EMAIL (NO CRASH EVER)
const emailBackground = (email, otp, name) => {
  setImmediate(async () => {
    try {
      await sendOtpEmail(email, otp, name);
      console.log(`✅ OTP sent to ${email}`);
    } catch (e) {
      console.error(`❌ Email failed for ${email}:`, e.message);
    }
  });
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailLower = email.toLowerCase().trim();

    const exists = await User.findOne({ email: emailLower });

    if (exists) {
      if (!exists.isVerified) {
        const otp = generateOtp();
        exists.otp = otp;
        exists.otpExpiry = Date.now() + 10 * 60 * 1000;
        await exists.save();

        res.json({
          message: "OTP resent",
          requiresVerification: true,
        });

        emailBackground(emailLower, otp, exists.name);
        return;
      }

      return res.status(400).json({ message: "Already registered" });
    }

    const otp = generateOtp();

    await User.create({
      name,
      email: emailLower,
      password,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
    });

    res.status(201).json({
      message: "Registered successfully",
      requiresVerification: true,
    });

    emailBackground(emailLower, otp, name);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= VERIFY OTP =================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) return res.status(404).json({ message: "Not found" });

    if (!user.isOtpValid(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      await user.save();

      res.status(403).json({
        message: "Verify email first",
        requiresVerification: true,
      });

      emailBackground(email.toLowerCase(), otp, user.name);
      return;
    }

    res.json({
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
};