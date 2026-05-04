const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail, sendBookingConfirmation } = require("../utils/emailService");

// 🔐 Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// 🔢 Generate OTP
const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

// 🔥 SAFE background email sender (IMPORTANT FIX)
const emailBackground = (email, otp, name) => {
  setImmediate(async () => {
    try {
      await sendOtpEmail(email, otp, name);
      console.log(`✅ OTP sent to ${email}`);
    } catch (e) {
      console.error(`❌ Email failed for ${email}:`, e.message);
      // ❗ DO NOT throw → prevents API crash
    }
  });
};

// ==============================
// 🟢 REGISTER
// ==============================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      specialization,
      experience,
      fees,
      hospital,
      city,
      phone,
      about,
    } = req.body;

    const emailLower = email.toLowerCase().trim();

    const exists = await User.findOne({ email: emailLower });

    // 🔁 If already exists but not verified
    if (exists) {
      if (!exists.isVerified) {
        const otp = generateOtp();
        exists.otp = otp;
        exists.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await exists.save();

        res.status(200).json({
          message: "OTP resent to your email.",
          requiresVerification: true,
          email: emailLower,
        });

        emailBackground(emailLower, otp, exists.name);
        return;
      }

      return res
        .status(400)
        .json({ message: "Email already registered. Please login." });
    }

    // 🆕 New user
    const otp = generateOtp();

    const userData = {
      name,
      email: emailLower,
      password,
      role: role || "user",
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    };

    // 👨‍⚕️ Doctor extra fields
    if (role === "doctor") {
      Object.assign(userData, {
        specialization,
        experience: Number(experience),
        fees: Number(fees),
        hospital,
        city,
        phone,
        about,
      });
    }

    await User.create(userData);

    // ✅ Respond first (VERY IMPORTANT)
    res.status(201).json({
      message: "Registered successfully! Check your email for OTP.",
      requiresVerification: true,
      email: emailLower,
    });

    // 📧 Send email in background
    emailBackground(emailLower, otp, name);
  } catch (err) {
    console.error("Register error:", err.message);

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email already registered. Please login." });
    }

    res
      .status(500)
      .json({ message: err.message || "Registration failed." });
  }
};

// ==============================
// 🟢 VERIFY OTP
// ==============================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user)
      return res.status(404).json({ message: "Account not found." });

    if (user.isVerified)
      return res
        .status(400)
        .json({ message: "Already verified. Please login." });

    if (!user.isOtpValid(otp))
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// 🟢 RESEND OTP
// ==============================
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user)
      return res.status(404).json({ message: "Account not found." });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified." });

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    res.json({ message: "New OTP sent to your email." });

    emailBackground(email.toLowerCase().trim(), otp, user.name);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// 🟢 LOGIN
// ==============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Invalid email or password." });
    }

    // 🔒 Not verified → send OTP again
    if (!user.isVerified) {
      const otp = generateOtp();

      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await user.save();

      res.status(403).json({
        message: "Email not verified. OTP sent.",
        requiresVerification: true,
        email: email.toLowerCase().trim(),
      });

      emailBackground(email.toLowerCase().trim(), otp, user.name);
      return;
    }

    // ✅ Verified login
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==============================
// 🟢 GET PROFILE
// ==============================
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
};