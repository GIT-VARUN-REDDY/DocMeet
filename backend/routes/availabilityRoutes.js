const express = require("express");
const router = express.Router();
const DoctorAvailability = require("../models/DoctorAvailability");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

// Convert "09:00 AM" / "02:30 PM" to minutes since midnight for comparison
const slotToMinutes = (slot) => {
  const [time, period] = slot.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const getCurrentMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

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

    // Check if entire date is blocked by doctor
    const avail = await DoctorAvailability.findOne({ doctor: doctorId });
    if (avail?.blockedDates?.includes(date)) {
      return res.json({ availableSlots: [], fullyBlocked: true });
    }

    // Get booked slots from confirmed appointments
    const booked = await Appointment.find({ doctor: doctorId, date, status: "Confirmed" });
    const bookedTimes = booked.map((a) => a.time);

    // Get doctor-blocked specific slots for this date
    const docBlockedSlots = avail?.blockedSlots
      ?.filter((s) => s.date === date)
      .map((s) => s.time) || [];

    const allSlots = doctor.slots || [];
    const isToday = date === getTodayStr();
    const currentMinutes = getCurrentMinutes();

    const availableSlots = allSlots.filter((slot) => {
      // Remove booked slots
      if (bookedTimes.includes(slot)) return false;

      // Remove doctor-blocked slots
      if (docBlockedSlots.includes(slot)) return false;

      // ✅ If today, remove slots whose time has already passed
      if (isToday && slotToMinutes(slot) <= currentMinutes) return false;

      return true;
    });

    res.json({ availableSlots, fullyBlocked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET doctor's own availability settings
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

// ── PUT block/unblock dates
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

// ── PUT block/unblock specific slots
router.put("/block-slots", protect, authorize("doctor"), async (req, res) => {
  try {
    const { date, slots } = req.body;
    let avail = await DoctorAvailability.findOne({ doctor: req.user._id });
    if (!avail) {
      avail = new DoctorAvailability({ doctor: req.user._id, blockedDates: [], blockedSlots: [] });
    }
    avail.blockedSlots = avail.blockedSlots.filter((s) => s.date !== date);
    slots.forEach((time) => avail.blockedSlots.push({ date, time }));
    await avail.save();
    res.json({ message: "Slots updated!", blockedSlots: avail.blockedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;