const express = require("express");
const router = express.Router();
const { createAuthMiddleware } = require("../middleware/auth.middleware");
const { createOrder,getMyOrders, getOrderById,cancelOrderById,updateOrderAddress } = require("../controllers/order.controller");
const validation = require("../middleware/validation.middleware")

router.post("/", createAuthMiddleware(["user"]), validation.createOrderValidation, createOrder)

router.get("/me", createAuthMiddleware([ "user" ]), getMyOrders)

router.get("/:id", createAuthMiddleware([ "user", "admin" ]), getOrderById)

router.post("/:id/cancel", createAuthMiddleware([ "user" ]), cancelOrderById)

router.patch("/:id/address", createAuthMiddleware([ "user" ]), validation.updateAddressValidation, updateOrderAddress)


module.exports = router;