const express = require("express");
const router = express.Router();
const { register, login, getCurrentUser } = require("../controllers/auth.controller");
const validators = require("../middlewares/validator.middleware");
const {authMiddleware} = require("../middlewares/auth.middleware");


router.post("/register", validators.registerValidator, register);
router.post("/login", validators.loginValidator, login);
router.get("/me", authMiddleware, getCurrentUser);



module.exports = router;
