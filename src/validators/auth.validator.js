const { body } = require("express-validator");

exports.registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];

exports.loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];