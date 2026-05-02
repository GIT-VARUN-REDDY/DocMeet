const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role:     { type: String, enum: ["user", "doctor"], default: "user" },

    // Email verification
    isVerified: { type: Boolean, default: false },
    otp:        { type: String },
    otpExpiry:  { type: Date },

    // Doctor-only fields
    specialization: { type: String },
    experience:     { type: Number, min: 0, max: 60 },
    fees:           { type: Number, min: 0 },
    hospital:       { type: String },   // ✅ hospital they work in
    city:           { type: String },   // ✅ city/location
    phone:          { type: String },   // ✅ contact number
    about:          { type: String },   // ✅ short bio
    available:      { type: Boolean, default: true },
    slots: {
      type: [String],
      default: ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.isOtpValid = function (enteredOtp) {
  return this.otp === enteredOtp && this.otpExpiry > Date.now();
};

module.exports = mongoose.model("User", userSchema);