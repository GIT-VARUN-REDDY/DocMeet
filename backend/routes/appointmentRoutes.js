const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendBookingConfirmation } = require("../utils/emailService");

// GET available slots
router.get("/available", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId and date required" });

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const booked = await Appointment.find({ doctor: doctorId, date, status: "Confirmed" });
    const bookedTimes = booked.map((a) => a.time);
    const availableSlots = (doctor.slots || []).filter((s) => !bookedTimes.includes(s));

    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST book appointment
router.post("/book", protect, authorize("user"), async (req, res) => {
  try {
    const { doctorId, date, time, symptoms } = req.body;
    if (!doctorId || !date || !time) return res.status(400).json({ message: "doctorId, date, time required" });

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const existing = await Appointment.findOne({ doctor: doctorId, date, time, status: "Confirmed" });
    if (existing) return res.status(409).json({ message: "Slot already booked. Choose another." });

    const appointment = await Appointment.create({
      user: req.user._id, doctor: doctorId, date, time,
      symptoms: symptoms || "General checkup", status: "Confirmed",
    });

    res.status(201).json({ message: "Appointment confirmed!", appointment });

    // Send confirmation email in background
    setImmediate(() => {
      sendBookingConfirmation(req.user.email, req.user.name, doctor.name, date, time)
        .catch((e) => console.error("Booking email failed:", e.message));
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my appointments (patient)
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

// GET doctor bookings
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

// DELETE cancel appointment
router.delete("/:id", protect, authorize("user"), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    await Appointment.deleteOne({ _id: req.params.id });
    res.json({ message: "Appointment cancelled." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;