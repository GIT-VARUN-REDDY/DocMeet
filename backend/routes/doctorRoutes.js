const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ IMPORTANT: specific routes MUST come before /:id
// Otherwise Express treats "me", "all", "profile" as MongoDB IDs

// ── GET own profile (doctor only) ──
router.get("/me/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select("-password -otp -otpExpiry");
    if (!doctor) return res.status(404).json({ message: "Profile not found" });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE own profile (doctor only) ──
router.put("/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const allowedFields = [
      "name", "phone", "hospital", "city", "about", "fees",
      "experience", "specialization", "available", "slots",
      "profilePhoto", "hospitalPhoto", "location",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.profilePhoto && updates.profilePhoto.length > 3_600_000)
      return res.status(400).json({ message: "Profile photo too large. Max 2MB." });
    if (updates.hospitalPhoto && updates.hospitalPhoto.length > 3_600_000)
      return res.status(400).json({ message: "Hospital photo too large. Max 2MB." });

    const doctor = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpiry");

    res.json({ doctor });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET all doctors (public) ──
router.get("/all", async (req, res) => {
  try {
    let excludeId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        excludeId = decoded.id;
      } catch (_) {}
    }

    // Include doctors by role OR by having specialization (covers legacy data)
    const query = {
      $or: [
        { role: "doctor" },
        { specialization: { $exists: true, $ne: "" } },
      ],
    };
    if (excludeId) query._id = { $ne: excludeId };

    const doctors = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET single doctor by ID (public) — MUST be last ──
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