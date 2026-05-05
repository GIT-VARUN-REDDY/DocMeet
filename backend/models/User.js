const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:       { type: String, required: true },
    role:           { type: String, enum: ["user", "doctor"], default: "user" },
    // Doctor fields
    specialization: { type: String },
    experience:     { type: Number },
    fees:           { type: Number },
    hospital:       { type: String },
    city:           { type: String },
    phone:          { type: String },
    about:          { type: String },
    available:      { type: Boolean, default: true },
    slots:          { type: [String], default: ["09:00 AM","10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"] },
    profilePhoto:   { type: String },
    hospitalPhoto:  { type: String },
    location: {
      lat:     { type: Number },
      lng:     { type: Number },
      address: { type: String },
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

module.exports = mongoose.model("User", userSchema);