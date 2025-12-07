const express = require('express');
const authGuard = require('../middleware/authGuard');

const ProductController = require('../controller/products');
const Product = require('../models/Products');

const router = express.Router();
const product = new ProductController(new Product());
router.route('/')
  .get(product.getProducts.bind(product))
  .post(authGuard, product.createProduct.bind(product));

router.route('/:id')
  .get(product.getProductById.bind(product))
  .put(authGuard, product.updateProduct)
  .delete(authGuard, product.deleteProduct);


module.exports = router;
