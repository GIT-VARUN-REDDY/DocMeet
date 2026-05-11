const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    doctor:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patient:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// One review per patient per doctor
reviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);