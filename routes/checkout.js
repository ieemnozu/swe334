// routes/checkout.js
const express = require('express');
const authGuard = require('../middleware/authGuard');
const CheckoutController = require('../controller/checkout');

const router = express.Router();
const checkoutController = new CheckoutController(); // <-- create instance

// POST /checkout
router.post('/', authGuard, checkoutController.checkout.bind(checkoutController));

module.exports = router;
