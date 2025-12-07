// routes/order.js
const express = require('express');
const authGuard = require('../middleware/authGuard');
const { requireRoles } = require('../middleware/roleGuard');

const OrdersController = require('../controller/orders');
const Orders = require('../models/Orders');

const router = express.Router();
const orders = new OrdersController(new Orders());

// ✅ Admin: all orders, stats, etc.
router
  .route('/')
  .get(authGuard, requireRoles(30), orders.getAllOrders.bind(orders)) // GET /api/orders
  .post(authGuard, orders.createOrder.bind(orders));                  // POST /api/orders

// ✅ Current user's orders
router.get(
  '/my-orders',
  authGuard,
  orders.getMyOrders.bind(orders)                                      // GET /api/orders/my-orders
);

// ✅ Single order by ID (owner or admin)
router
  .route('/:id')
  .get(authGuard, requireRoles(30), orders.getOrderById.bind(orders))                    // GET /api/orders/:id
  .put(authGuard, orders.updateOrder.bind(orders))                     // PUT /api/orders/:id
  .delete(
    authGuard,
    requireRoles(30),
    orders.deleteOrder.bind(orders)                                    // DELETE /api/orders/:id
  );
router.post(
  '/filter',
  authGuard,
  requireRoles(30),                    // admin-only; remove if not needed
  orders.filterOrders.bind(orders)
);

module.exports = router;
