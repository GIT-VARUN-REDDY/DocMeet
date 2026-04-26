const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/emailService");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// ─────────────────────────────────────────
// @POST /api/auth/register
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, experience, fees } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      if (!exists.isVerified) {
        const otp = generateOtp();
        exists.otp = otp;
        exists.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await exists.save();

        // Non-blocking email
        sendOtpEmail(email, otp, exists.name).catch((e) =>
          console.error("OTP email failed:", e.message)
        );

        return res.status(200).json({
          message: "Account exists but not verified. A new OTP has been sent.",
          requiresVerification: true,
          email,
        });
      }
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const userData = {
      name,
      email,
      password,
      role: role || "user",
      otp,
      otpExpiry,
      isVerified: false,
    };

    if (role === "doctor") {
      userData.specialization = specialization;
      userData.experience = Number(experience);
      userData.fees = Number(fees);
    }

    const user = await User.create(userData);

    // ✅ Non-blocking — registration succeeds even if email fails
    sendOtpEmail(email, otp, name).catch((e) =>
      console.error("OTP email failed (check EMAIL_USER/EMAIL_PASS in .env):", e.message)
    );

    res.status(201).json({
      message: "Registration successful! Check your email for the OTP.",
      requiresVerification: true,
      email,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Registration failed. Please try again." });
  }
};

// ─────────────────────────────────────────
// @POST /api/auth/verify-otp
// ─────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Account not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Account already verified. Please login." });

    if (!user.isOtpValid(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

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
      message: "Email verified! Welcome to DocMeet.",
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

// ─────────────────────────────────────────
// @POST /api/auth/resend-otp
// ─────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Account not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOtpEmail(email, otp, user.name).catch((e) =>
      console.error("Resend OTP email failed:", e.message)
    );

    res.json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// ─────────────────────────────────────────
// @POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      sendOtpEmail(email, otp, user.name).catch((e) =>
        console.error("Login OTP email failed:", e.message)
      );

      return res.status(403).json({
        message: "Email not verified. A new OTP has been sent.",
        requiresVerification: true,
        email,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ─────────────────────────────────────────
// @GET /api/auth/me
// ─────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};

module.exports = { register, verifyOtp, resendOtp, login, getMe };