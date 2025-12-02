const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  logout,
  getAddresses,
  addAddress,
  deleteAddress,
} = require("../controllers/auth.controller");
const validators = require("../middlewares/validator.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/register", validators.registerValidator, register);
router.post("/login", validators.loginValidator, login);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/logout", logout);

router.get("/users/me/addresses", authMiddleware, getAddresses);
router.post(
  "/users/me/addresses",
  authMiddleware,
  validators.addressValidator,
  addAddress
);
router.delete("/users/me/addresses/:addressId", authMiddleware, deleteAddress);

module.exports = router;
