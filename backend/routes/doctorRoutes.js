const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET own profile — must be before /:id
router.get("/me/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select("-password -otp -otpExpiry");
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update profile
router.put("/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const allowed = ["name","phone","hospital","city","about","fees","experience","specialization","available","slots","profilePhoto","hospitalPhoto","location"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const doctor = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select("-password -otp -otpExpiry");
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all doctors
router.get("/all", async (req, res) => {
  try {
    let excludeId = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try { const d = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET); excludeId = d.id; } catch (_) {}
    }

    const query = { $or: [{ role: "doctor" }, { specialization: { $exists: true, $ne: "" } }] };
    if (excludeId) query._id = { $ne: excludeId };

    const doctors = await User.find(query).select("-password -otp -otpExpiry").sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single doctor — must be last
router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("-password -otp -otpExpiry");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;