const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// GET all doctors — excludes the logged-in doctor from their own listing
router.get("/all", async (req, res) => {
  try {
    let excludeId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        excludeId = decoded.id;
      } catch (_) {}
    }

    const query = { role: "doctor", available: true };
    if (excludeId) query._id = { $ne: excludeId };

    const doctors = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" })
      .select("-password -otp -otpExpiry");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;