const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware"); // ✅ destructured
const { sendBookingConfirmation } = require("../utils/emailService");

// GET available slots
router.get("/available", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date)
      return res.status(400).json({ message: "doctorId and date are required" });

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const booked = await Appointment.find({ doctor: doctorId, date, status: "Confirmed" });
    const bookedTimes = booked.map((a) => a.time);
    const availableSlots = (doctor.slots || []).filter((s) => !bookedTimes.includes(s));

    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST book appointment — patients only
router.post("/book", protect, authorize("user"), async (req, res) => {
  try {
    const { doctorId, date, time, symptoms } = req.body;
    if (!doctorId || !date || !time)
      return res.status(400).json({ message: "doctorId, date, and time are required" });

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const existing = await Appointment.findOne({ doctor: doctorId, date, time, status: "Confirmed" });
    if (existing)
      return res.status(409).json({ message: "This slot is already booked. Please choose another." });

    const appointment = await Appointment.create({
      user: req.user._id,
      doctor: doctorId,
      date,
      time,
      symptoms: symptoms || "General checkup",
      status: "Confirmed",
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation(req.user.email, req.user.name, doctor.name, date, time)
      .catch((e) => console.error("Email failed (non-critical):", e.message));

    res.status(201).json({ message: "Appointment confirmed!", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my appointments — patients only
router.get("/my", protect, authorize("user"), async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate("doctor", "name specialization fees experience")
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET doctor bookings — doctors only
router.get("/doctor-bookings", protect, authorize("doctor"), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate("user", "name email")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE cancel — patients only
router.delete("/:id", protect, authorize("user"), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    await Appointment.deleteOne({ _id: req.params.id });
    res.json({ message: "Appointment cancelled. The slot is now available for others." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;