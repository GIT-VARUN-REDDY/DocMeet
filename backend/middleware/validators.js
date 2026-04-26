const { body, validationResult } = require("express-validator");

// Return errors if any validation fails
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Register validation rules
const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),

  body("role")
    .optional()
    .isIn(["user", "doctor"]).withMessage("Role must be user or doctor"),

  body("specialization")
    .if(body("role").equals("doctor"))
    .notEmpty().withMessage("Specialization is required for doctors"),

  body("experience")
    .if(body("role").equals("doctor"))
    .isNumeric().withMessage("Experience must be a number")
    .isInt({ min: 0, max: 60 }).withMessage("Experience must be between 0 and 60 years"),

  body("fees")
    .if(body("role").equals("doctor"))
    .isNumeric().withMessage("Fees must be a number")
    .isInt({ min: 1 }).withMessage("Fees must be greater than 0"),
];

// Login validation rules
const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

// OTP verification rules
const otpRules = [
  body("email")
    .trim()
    .isEmail().withMessage("Valid email is required"),

  body("otp")
    .trim()
    .notEmpty().withMessage("OTP is required")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
    .isNumeric().withMessage("OTP must be numeric"),
];

module.exports = { validate, registerRules, loginRules, otpRules };