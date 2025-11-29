const { body, validationResult } = require("express-validator");

const responseWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

const registerValidator = [
    body("username")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Username is required"),
    body("email")
        .isEmail()
        .isString()
        .notEmpty()
        .withMessage("Email is required"),
    body("password")
        .isLength({ min: 6 })
        .notEmpty()
        .withMessage("Password is required"),
    body("firstname")
        .isString()
        .notEmpty()
        .withMessage("First name is required"),
    body("lastname")
        .isString()
        .notEmpty()
        .withMessage("Last name is required"),
    responseWithValidationErrors
];

module.exports = { registerValidator };