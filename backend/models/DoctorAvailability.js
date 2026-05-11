const mongoose = require("mongoose");

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    blockedDates: { type: [String], default: [] }, // "YYYY-MM-DD" format
    blockedSlots: [
      {
        date: { type: String }, // "YYYY-MM-DD"
        time: { type: String }, // "09:00 AM"
      }
    ],
  },
  { timestamps: true }
);

doctorAvailabilitySchema.index({ doctor: 1 }, { unique: true });

module.exports = mongoose.model("DoctorAvailability", doctorAvailabilitySchema);