const express = require("express");
const router = express.Router();
const multer = require('multer');
const { createProduct, getProducts, getProductById,updateProduct, deleteProduct, getProductsBySeller } = require("../controllers/product.controllers");
const { createAuthMiddleware } = require("../middleware/auth.middleware");
const { createProductValidators } = require("../validators/product.validators");
const upload = multer({ storage: multer.memoryStorage() });



router.post("/", createAuthMiddleware(["admin", "seller"]), upload.array('images', 5),  createProductValidators, createProduct);

router.get('/',  getProducts)
// GET /api/products/:id
router.patch("/:id", createAuthMiddleware([ "seller" ]), updateProduct);
router.delete("/:id", createAuthMiddleware([ "seller" ]), deleteProduct);

router.get("/seller", createAuthMiddleware([ "seller" ]), getProductsBySeller);
router.get('/:id', getProductById);



module.exports = router;    