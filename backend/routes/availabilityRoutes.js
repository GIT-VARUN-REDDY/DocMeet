const express = require("express");
const router = express.Router();

const DoctorAvailability = require("../models/DoctorAvailability");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

const { protect, authorize } = require("../middleware/authMiddleware");

// Convert slot time to minutes
const slotToMinutes = (slot) => {
  const [time, period] = slot.split(" ");

  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

// Get Indian current time
const getIndianCurrentMinutes = () => {
  const indiaTime = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  return indiaTime.getHours() * 60 + indiaTime.getMinutes();
};

// Get today's Indian date
const getIndianToday = () => {
  const indiaTime = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );

  return `${indiaTime.getFullYear()}-${String(
    indiaTime.getMonth() + 1
  ).padStart(2, "0")}-${String(
    indiaTime.getDate()
  ).padStart(2, "0")}`;
};

// ─────────────────────────────────────────────
// GET doctor availability
// ─────────────────────────────────────────────
router.get("/:doctorId", async (req, res) => {
  try {

    const avail = await DoctorAvailability.findOne({
      doctor: req.params.doctorId,
    });

    res.json({
      blockedDates: avail?.blockedDates || [],
      blockedSlots: avail?.blockedSlots || [],
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET available slots
// ─────────────────────────────────────────────
router.get("/:doctorId/slots/:date", async (req, res) => {

  try {

    const { doctorId, date } = req.params;

    // Find doctor
    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Doctor availability
    const avail = await DoctorAvailability.findOne({
      doctor: doctorId,
    });

    // Fully blocked date
    if (avail?.blockedDates?.includes(date)) {
      return res.json({
        availableSlots: [],
        fullyBlocked: true,
      });
    }

    // Booked appointments
    const booked = await Appointment.find({
      doctor: doctorId,
      date,
      status: "Confirmed",
    });

    const bookedTimes = booked.map((a) => a.time);

    // Blocked slots
    const docBlockedSlots =
      avail?.blockedSlots
        ?.filter((s) => s.date === date)
        .map((s) => s.time) || [];

    // Doctor slots
    const allSlots = doctor.slots || [];

    // Today logic
    const today = getIndianToday();

    const isToday = date === today;

    const currentMinutes = getIndianCurrentMinutes();

    // Final filtering
    const availableSlots = allSlots.filter((slot) => {

      // Already booked
      if (bookedTimes.includes(slot)) {
        return false;
      }

      // Manually blocked
      if (docBlockedSlots.includes(slot)) {
        return false;
      }

      // Remove past slots for today
      if (isToday) {

        const slotMinutes = slotToMinutes(slot);

        if (slotMinutes <= currentMinutes) {
          return false;
        }
      }

      return true;
    });

    res.json({
      availableSlots,
      fullyBlocked: false,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET doctor settings
// ─────────────────────────────────────────────
router.get(
  "/me/settings",
  protect,
  authorize("doctor"),
  async (req, res) => {

    try {

      const avail = await DoctorAvailability.findOne({
        doctor: req.user._id,
      });

      res.json({
        blockedDates: avail?.blockedDates || [],
        blockedSlots: avail?.blockedSlots || [],
      });

    } catch (err) {

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ─────────────────────────────────────────────
// BLOCK DATES
// ─────────────────────────────────────────────
router.put(
  "/block-dates",
  protect,
  authorize("doctor"),
  async (req, res) => {

    try {

      const { blockedDates } = req.body;

      const avail = await DoctorAvailability.findOneAndUpdate(
        { doctor: req.user._id },

        {
          $set: { blockedDates },
        },

        {
          upsert: true,
          new: true,
        }
      );

      res.json({
        message: "Availability updated!",
        blockedDates: avail.blockedDates,
      });

    } catch (err) {

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ─────────────────────────────────────────────
// BLOCK SLOTS
// ─────────────────────────────────────────────
router.put(
  "/block-slots",
  protect,
  authorize("doctor"),
  async (req, res) => {

    try {

      const { date, slots } = req.body;

      let avail = await DoctorAvailability.findOne({
        doctor: req.user._id,
      });

      if (!avail) {

        avail = new DoctorAvailability({
          doctor: req.user._id,
          blockedDates: [],
          blockedSlots: [],
        });
      }

      // Remove old blocked slots
      avail.blockedSlots = avail.blockedSlots.filter(
        (s) => s.date !== date
      );

      // Add new blocked slots
      slots.forEach((time) => {
        avail.blockedSlots.push({ date, time });
      });

      await avail.save();

      res.json({
        message: "Slots updated!",
        blockedSlots: avail.blockedSlots,
      });

    } catch (err) {

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router; 
