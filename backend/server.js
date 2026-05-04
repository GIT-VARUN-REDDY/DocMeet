const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://doc-meet-red.vercel.app"
  ],
  credentials: true
}));

// ✅ Increase payload limit for images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointment", appointmentRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "DocMeet API running ✅" });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log("404 hit:", req.method, req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });