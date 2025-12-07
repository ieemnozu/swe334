const Payment = require('../models/Payment');

class PaymentController {
  constructor(paymentModel) {
    this.paymentModel = paymentModel;
  }

  // ✅ Create payment and link to order
  async createPayment(req, res, next) {
    try {
      const user_id = req.user_id; // From authGuard
      const { amount, method, order_id } = req.body;

      if (!amount || !method) {
        return res.status(400).json({
          success: false,
          error: 'Amount and payment method are required'
        });
      }

      // Create payment
      const payment = await this.paymentModel.createPayment({
        user_id,
        amount,
        method,
        status: 'pending'
      });

      // Link to order if provided
      let orderPayment = null;
      if (order_id) {
        orderPayment = await this.paymentModel.linkPaymentToOrder(order_id, payment.id);
      }

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: {
          payment,
          order_link: orderPayment
        }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Get current user's payments
  async getMyPayments(req, res, next) {
    try {
      const user_id = req.user_id;
      const payments = await this.paymentModel.getPaymentsByUserId(user_id);

      res.json({
        success: true,
        data: { payments }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Get payment by ID (with ownership check)
  async getPaymentById(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await this.paymentModel.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Check ownership (unless admin)
      if (payment.user_id !== req.user_id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - you can only view your own payments'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Get all payments (admin only)
  async getAllPayments(req, res, next) {
    try {
      const payments = await this.paymentModel.getAllPayments();

      res.json({
        success: true,
        data: { payments }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Update payment status (admin only)
  async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const payment = await this.paymentModel.updatePaymentStatus(id, status);

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: { payment }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Get payment with order details
  async getPaymentWithOrder(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await this.paymentModel.getPaymentWithOrder(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Check ownership
      if (payment.user_id !== req.user_id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Get payments by status (admin only)
  async getPaymentsByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const payments = await this.paymentModel.getPaymentsByStatus(status);

      res.json({
        success: true,
        data: { payments }
      });

    } catch (err) {
      next(err);
    }
  }

  // ✅ Delete payment (admin only)
  async deletePayment(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await this.paymentModel.deletePayment(id);

      res.json({
        success: true,
        message: 'Payment deleted successfully',
        data: { payment }
      });

    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;