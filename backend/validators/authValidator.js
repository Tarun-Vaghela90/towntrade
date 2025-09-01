const { body } = require("express-validator");

exports.signupValidator = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];


exports.email_verification = [
    body("email").isEmail().withMessage("Valid email is required")
]

exports.password_verify = [
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
]