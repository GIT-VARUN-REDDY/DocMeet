const express = require("express");
const router = express.Router();
const DoctorAvailability = require("../models/DoctorAvailability");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

// ── GET doctor's availability (public)
router.get("/:doctorId", async (req, res) => {
  try {
    const avail = await DoctorAvailability.findOne({ doctor: req.params.doctorId });
    res.json({
      blockedDates: avail?.blockedDates || [],
      blockedSlots: avail?.blockedSlots || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET available slots for a date (public)
router.get("/:doctorId/slots/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check if entire date is blocked
    const avail = await DoctorAvailability.findOne({ doctor: doctorId });
    if (avail?.blockedDates?.includes(date)) {
      return res.json({ availableSlots: [], fullyBlocked: true });
    }

    // Get booked slots from appointments
    const booked = await Appointment.find({ doctor: doctorId, date, status: "Confirmed" });
    const bookedTimes = booked.map((a) => a.time);

    // Get doctor-blocked slots for this date
    const docBlocked = avail?.blockedSlots
      ?.filter((s) => s.date === date)
      .map((s) => s.time) || [];

    // Available = all slots minus booked minus doctor-blocked
    const allSlots = doctor.slots || [];
    const availableSlots = allSlots.filter(
      (s) => !bookedTimes.includes(s) && !docBlocked.includes(s)
    );

    res.json({ availableSlots, fullyBlocked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET doctor's own availability (doctor only)
router.get("/me/settings", protect, authorize("doctor"), async (req, res) => {
  try {
    const avail = await DoctorAvailability.findOne({ doctor: req.user._id });
    res.json({
      blockedDates: avail?.blockedDates || [],
      blockedSlots: avail?.blockedSlots || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT block/unblock dates (doctor only)
router.put("/block-dates", protect, authorize("doctor"), async (req, res) => {
  try {
    const { blockedDates } = req.body;

    const avail = await DoctorAvailability.findOneAndUpdate(
      { doctor: req.user._id },
      { $set: { blockedDates } },
      { upsert: true, new: true }
    );

    res.json({ message: "Availability updated!", blockedDates: avail.blockedDates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT block/unblock specific slots (doctor only)
router.put("/block-slots", protect, authorize("doctor"), async (req, res) => {
  try {
    const { date, slots } = req.body; // slots = array of times to block for this date

    let avail = await DoctorAvailability.findOne({ doctor: req.user._id });
    if (!avail) {
      avail = new DoctorAvailability({ doctor: req.user._id, blockedDates: [], blockedSlots: [] });
    }

    // Remove existing blocked slots for this date
    avail.blockedSlots = avail.blockedSlots.filter((s) => s.date !== date);

    // Add new blocked slots for this date
    slots.forEach((time) => {
      avail.blockedSlots.push({ date, time });
    });

    await avail.save();
    res.json({ message: "Slots updated!", blockedSlots: avail.blockedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;