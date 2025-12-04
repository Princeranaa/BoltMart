const express  = require('express');
const router = express.Router();
const { createPayment, verifyPayment } = require('../controllers/payment.controller');
const {createAuthMiddleware} = require("../middleware/auth.middleware")

router.post("/create/:orderId", createAuthMiddleware ([ "user" ]),createPayment)

router.post("/verify", createAuthMiddleware([ "user" ]), verifyPayment)



module.exports = router;