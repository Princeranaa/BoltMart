const express  = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/payment.controller');
const {createAuthMiddleware} = require("../middleware/auth.middleware")

router.post("/create/:orderId", createAuthMiddleware ([ "user" ]),createPayment)



module.exports = router;