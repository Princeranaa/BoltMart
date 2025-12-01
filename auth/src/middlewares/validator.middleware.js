const { body, validationResult } = require("express-validator");

const responseWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg, // return first error as message
    });
  }
  next();
};

const registerValidator = [
  body("username")
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("firstname").notEmpty().withMessage("First name is required"),

  body("lastname").notEmpty().withMessage("Last name is required"),

  responseWithValidationErrors,
];

const loginValidator = [
  // First check for required fields (before any other validator runs)
  (req, res, next) => {
    const { email, username, password } = req.body;

    // If password is missing OR both identity fields missing → fail
    if (!password || (!email && !username)) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    next();
  },

  // VALIDATION RULES (only run when required fields are filled)
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  responseWithValidationErrors,
];




module.exports = { registerValidator, loginValidator };
