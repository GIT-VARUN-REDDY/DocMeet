const express = require("express");
const router = express.Router();
const { register, verifyOtp, resendOtp, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // ✅ destructured
const { validate, registerRules, loginRules, otpRules } = require("../middleware/validators");

router.post("/register",   registerRules, validate, register);
router.post("/verify-otp", otpRules,      validate, verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login",      loginRules,    validate, login);
router.get("/me",          protect,               getMe);

module.exports = router;