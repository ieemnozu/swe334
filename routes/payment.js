const express = require('express');
const authGuard = require('../middleware/authGuard');
const { requireRoles } = require('../middleware/roleGuard'); 

const PaymentController = require('../controllers/payment');
const Payment = require('../models/Payment');

const router = express.Router();
const paymentController = new PaymentController(new Payment());

// ✅ Base routes - accessible to all authenticated users
router.route('/')
  .post(authGuard, paymentController.createPayment.bind(paymentController));

router.route('/my-payments')
  .get(authGuard, paymentController.getMyPayments.bind(paymentController));

// ✅ Routes with ID parameter - accessible to payment owners
router.route('/:id')
  .get(authGuard, paymentController.getPaymentById.bind(paymentController));

router.route('/:id/order')
  .get(authGuard, paymentController.getPaymentWithOrder.bind(paymentController));

// ✅ Admin routes - require admin role (30)
router.route('/admin/all')
  .get(authGuard, requireRoles(30), paymentController.getAllPayments.bind(paymentController));

router.route('/admin/status/:status')
  .get(authGuard, requireRoles(30), paymentController.getPaymentsByStatus.bind(paymentController));

router.route('/admin/:id/status')
  .put(authGuard, requireRoles(30), paymentController.updatePaymentStatus.bind(paymentController));

router.route('/admin/:id')
  .delete(authGuard, requireRoles(30), paymentController.deletePayment.bind(paymentController));

module.exports = router;