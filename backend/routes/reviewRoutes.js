const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

// POST /api/reviews — submit a review (patients only)
router.post("/", protect, authorize("user"), async (req, res) => {
  try {
    const { doctorId, rating, comment, appointmentId } = req.body;

    if (!doctorId || !rating)
      return res.status(400).json({ message: "Doctor and rating are required" });

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    // Verify patient has had an appointment with this doctor
    const appointment = await Appointment.findOne({
      user: req.user._id,
      doctor: doctorId,
    });

    if (!appointment)
      return res.status(403).json({ message: "You can only review doctors you have visited" });

    // Check if already reviewed
    const existing = await Review.findOne({ doctor: doctorId, patient: req.user._id });
    if (existing)
      return res.status(400).json({ message: "You have already reviewed this doctor" });

    const review = await Review.create({
      doctor: doctorId,
      patient: req.user._id,
      appointment: appointmentId || appointment._id,
      rating,
      comment,
    });

    // Update doctor's average rating in User model
    await updateDoctorRating(doctorId);

    const populated = await Review.findById(review._id).populate("patient", "name");
    res.status(201).json({ message: "Review submitted!", review: populated });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "You have already reviewed this doctor" });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/:doctorId — get all reviews for a doctor
router.get("/:doctorId", async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate("patient", "name")
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, average: Number(avg), total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/check/:doctorId — check if patient can review
router.get("/check/:doctorId", protect, authorize("user"), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      user: req.user._id,
      doctor: req.params.doctorId,
    });

    const existing = await Review.findOne({
      doctor: req.params.doctorId,
      patient: req.user._id,
    });

    res.json({
      canReview: !!appointment && !existing,
      hasAppointment: !!appointment,
      hasReviewed: !!existing,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id — delete own review
router.delete("/:id", protect, authorize("user"), async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, patient: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const doctorId = review.doctor;
    await Review.deleteOne({ _id: req.params.id });
    await updateDoctorRating(doctorId);

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper — recalculate and save doctor's average rating
async function updateDoctorRating(doctorId) {
  const reviews = await Review.find({ doctor: doctorId });
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await User.findByIdAndUpdate(doctorId, {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });
}

module.exports = router;