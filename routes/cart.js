const express = require('express');
const authGuard = require('../middleware/authGuard');
const { requireRoles } = require('../middleware/roleGuard');

const CartController = require('../controller/cart');
const Cart = require('../models/Cart'); 
const router = express.Router();
const cart = new CartController(new Cart());

// ✅ Public routes (with authentication)
router.route('/')
  .get(authGuard, requireRoles(30), cart.getCarts.bind(cart))           // Get all carts (admin view)
  .post(authGuard, cart.createCart.bind(cart));       // Add to current user's cart

// ✅ Current user's cart routes
router.route('/my-cart')
  .get(authGuard, cart.getMyCart.bind(cart))          // Get current user's cart
  .delete(authGuard, cart.clearMyCart.bind(cart));    // Clear current user's cart

// ✅ Specific cart item routes (with ownership checks)
router.route('/:id')
  .get(authGuard, cart.getCartById.bind(cart))        // Get specific cart item
  .put(authGuard, cart.updateCart.bind(cart))         // Update cart item
  .delete(authGuard, cart.deleteCart.bind(cart));     // Delete cart item

module.exports = router;