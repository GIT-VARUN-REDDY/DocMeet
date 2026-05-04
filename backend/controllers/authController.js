const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Send email in background — never blocks the response
const sendEmailBackground = (email, otp, name) => {
  // Use setImmediate so it runs AFTER response is sent
  setImmediate(async () => {
    try {
      const { sendOtpEmail } = require("../utils/emailService");
      await sendOtpEmail(email, otp, name);
      console.log(`✅ OTP email sent to ${email} — OTP: ${otp}`);
    } catch (err) {
      console.error(`❌ OTP email failed for ${email}:`, err.message);
      console.log(`📋 OTP for ${email} is: ${otp} (use this manually if email fails)`);
    }
  });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
   

    console.log("EMAIL:", process.env.EMAIL_USER); // 👈 ADD THIS

   
    console.log("📝 Register attempt:", req.body.email, "| role:", req.body.role);

    const { name, email, password, role, specialization, experience, fees, hospital, city, phone, about } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already exists
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      if (!exists.isVerified) {
        const otp = generateOtp();
        exists.otp = otp;
        exists.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await exists.save();

        // ✅ Respond FIRST, then send email
        res.status(200).json({
          message: "Account exists but not verified. A new OTP has been sent.",
          requiresVerification: true,
          email: normalizedEmail,
        });

        sendEmailBackground(normalizedEmail, otp, exists.name);
        return;
      }
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const userData = {
      name,
      email: normalizedEmail,
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
      if (hospital) userData.hospital = hospital;
      if (city) userData.city = city;
      if (phone) userData.phone = phone;
      if (about) userData.about = about;
    }

    await User.create(userData);
    console.log("✅ User created:", normalizedEmail);

    // ✅ Respond IMMEDIATELY — don't wait for email
    res.status(201).json({
      message: "Registration successful! Check your email for the OTP.",
      requiresVerification: true,
      email: normalizedEmail,
    });

    // Send email AFTER response
    sendEmailBackground(normalizedEmail, otp, name);

  } catch (err) {
    console.error("❌ Register error:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }
    res.status(500).json({ message: err.message || "Registration failed. Please try again." });
  }
};

// @POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "Account not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified. Please login." });
    if (!user.isOtpValid(otp)) return res.status(400).json({ message: "Invalid or expired OTP. Request a new one." });

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
    console.error("OTP verify error:", err.message);
    res.status(500).json({ message: err.message || "Verification failed." });
  }
};

// @POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "Account not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // ✅ Respond first
    res.json({ message: "A new OTP has been sent to your email." });

    // Send email after
    sendEmailBackground(email.toLowerCase().trim(), otp, user.name);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to resend OTP" });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // ✅ Respond first
      res.status(403).json({
        message: "Email not verified. A new OTP has been sent.",
        requiresVerification: true,
        email: email.toLowerCase().trim(),
      });

      sendEmailBackground(email.toLowerCase().trim(), otp, user.name);
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: err.message || "Login failed." });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
};

module.exports = { register, verifyOtp, resendOtp, login, getMe };