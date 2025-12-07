const express = require('express');
const authGuard = require('../middleware/authGuard');

const DiscountController = require('../controller/discount');
const Discount = require('../models/Discount');
const router = express.Router();
const discount = new DiscountController(new Discount());

router.route('/')
  .get(discount.getDiscounts.bind(discount))
  .post(authGuard, discount.createDiscount.bind(discount));
router.route('/:id')
  .get(discount.getDiscountById.bind(discount))
  .put(authGuard, discount.updateDiscount.bind(discount))
  .delete(authGuard, discount.deleteDiscount.bind(discount));

module.exports = router;