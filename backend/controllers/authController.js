const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, experience, fees, hospital, city, phone, about } = req.body;
    const emailLower = email.toLowerCase().trim();

    const exists = await User.findOne({ email: emailLower });
    if (exists) return res.status(400).json({ message: "Email already registered. Please login." });

    const userData = {
      name, email: emailLower, password,
      role: role || "user",
    };

    if (role === "doctor") {
      Object.assign(userData, {
        specialization,
        experience: Number(experience),
        fees: Number(fees),
        hospital, city, phone, about,
      });
    }

    const user = await User.create(userData);
    console.log("✅ User registered:", emailLower);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: "Registration successful!",
    });
  } catch (err) {
    console.error("Register error:", err.message);
    if (err.code === 11000) return res.status(400).json({ message: "Email already registered. Please login." });
    res.status(500).json({ message: err.message || "Registration failed." });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });

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

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
};

module.exports = { register, login, getMe };