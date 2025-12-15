const express = require('express');
const authGuard = require('../middleware/authGuard');
const upload = require("../middleware/upload");

const ProductController = require('../controller/products');
const Product = require('../models/Products');

const router = express.Router();
const product = new ProductController(new Product());
router.route("/")
  .get(product.getProducts.bind(product))
  .post(
    authGuard,
    upload.array("images", 10), // 👈 up to 10 images
    product.createProduct.bind(product)
  );

router.route('/:id')
  .get(product.getProductById.bind(product))
  .delete(authGuard, product.deleteProduct.bind(product));
router.put(
  '/:id',
  authGuard,
  upload.array('images', 5), // if using multer
  product.updateProduct.bind(product)
);

module.exports = router;
