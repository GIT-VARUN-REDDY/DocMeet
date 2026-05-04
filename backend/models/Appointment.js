const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date:     { type: String, required: true },
    time:     { type: String, required: true },
    symptoms: { type: String, default: "General checkup" },
    status:   { type: String, enum: ["Confirmed", "Cancelled"], default: "Confirmed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);