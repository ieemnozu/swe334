const express = require('express');
const authGuard = require('../middleware/authGuard');

const OrderItemController = require('../controller/orderitem');
const OrderItem = require('../models/OrderItem');
const router = express.Router();
const orderItem = new OrderItemController(new OrderItem());

router.route('/')
    .get(orderItem.getOrderItems.bind(orderItem))
    .post(authGuard, orderItem.createOrderItem.bind(orderItem));
router.route('/order/:orderId')
    .get(orderItem.getOrderItemsByOrderId.bind(orderItem));
router.route('/:id')
    .get(orderItem.getOrderItemById.bind(orderItem))
    .put(authGuard, orderItem.updateOrderItem.bind(orderItem))
    .delete(authGuard, orderItem.deleteOrderItem.bind(orderItem));

module.exports = router;
    
