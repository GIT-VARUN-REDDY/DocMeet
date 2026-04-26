const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET all doctors (users with role=doctor)
router.get("/all", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", available: true }).select("-password");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single doctor
router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" }).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;