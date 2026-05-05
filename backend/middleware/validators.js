const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name too short"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Min 6 characters")
    .matches(/[A-Z]/).withMessage("Need one uppercase letter").matches(/[0-9]/).withMessage("Need one number"),
];

const loginRules = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { validate, registerRules, loginRules };