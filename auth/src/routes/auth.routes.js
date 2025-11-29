const express = require('express');
const router = express.Router();
const { register } = require('../controllers/auth.controller');
const validators = require("../middlewares/validator.middleware");


router.post('/register', validators.registerValidator, register );

module.exports = router;
