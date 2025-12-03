const express = require("express");
const router = express.Router();
const { createAuthMiddleware } = require("../middleware/auth.middleware");
const { createOrder } = require("../controllers/order.controller");
const validation = require("../middleware/validation.middleware")

router.post("/", createAuthMiddleware(["user"]), validation.createOrderValidation, createOrder)





module.exports = router;