const express = require("express");
const router = express.Router();

console.log("✅ authRoutes.js loaded");

// Load dependencies with error catching
let authController, protect, validators;

try {
  authController = require("../controllers/authController");
  console.log("✅ authController loaded, functions:", Object.keys(authController));
} catch (e) {
  console.error("❌ authController FAILED to load:", e.message);
  process.exit(1);
}

try {
  const middleware = require("../middleware/authMiddleware");
  protect = middleware.protect;
  console.log("✅ authMiddleware loaded");
} catch (e) {
  console.error("❌ authMiddleware FAILED to load:", e.message);
  process.exit(1);
}

try {
  validators = require("../middleware/validators");
  console.log("✅ validators loaded");
} catch (e) {
  console.error("❌ validators FAILED to load:", e.message);
  process.exit(1);
}

const { register, verifyOtp, resendOtp, login, getMe } = authController;
const { validate, registerRules, loginRules, otpRules } = validators;

router.post("/register",   registerRules, validate, register);
router.post("/verify-otp", otpRules,      validate, verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login",      loginRules,    validate, login);
router.get("/me",          protect,               getMe);

console.log("✅ Auth routes registered: /register, /login, /verify-otp, /resend-otp, /me");

module.exports = router;