const express = require("express");
const router = express.Router();
const validation = require("../middleware/validation.middleware");
const { createAuthMiddleware } = require("../middleware/auth.middleware");
const { addItemToCart, updateItemQuantity, getCart } = require("../controllers/cart.controller");

router.get('/',createAuthMiddleware([ 'user' ]), getCart);

router.post("/items", validation.validateAddItemToCart ,createAuthMiddleware(["user"]), addItemToCart);

router.patch('/items/:productId',validation.validateUpdateCartItem,createAuthMiddleware([ 'user' ]),updateItemQuantity);

module.exports = router;
