const Orders = require('../models/Orders');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const WarehouseStock = require('../models/WarehouseStock');
const { pool } = require('../db');

class CheckoutController {
  constructor() {
    this.orderModel = new Orders();
    this.orderItemModel = new OrderItem();
    this.cartModel = new Cart();
    this.paymentModel = new Payment();
    this.warehouseStockModel = new WarehouseStock();
  }

  /* ============================================================
     CHECKOUT
     - user_id from token
     - warehouse_id from cart
     - stock deducted from warehouse_stock
     - transaction-safe (FOR UPDATE)
  ============================================================ */
  async checkout(req, res, next) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      console.log('🔍 Checkout started');

      const user_id = req.user.id;
      const { selectedCartItemIds, shipping_address, payment_method = 'card' } = req.body;

      /* -------------------- Validation -------------------- */
      if (!selectedCartItemIds || selectedCartItemIds.length === 0) {
        throw new Error('No cart items selected');
      }

      if (!shipping_address) {
        throw new Error('Shipping address is required');
      }

      /* -------------------- Get cart items -------------------- */
      const cartItems = await this.cartModel.getCartItemsWithDetails(selectedCartItemIds);

      if (!cartItems || cartItems.length === 0) {
        throw new Error('No valid cart items found');
      }

      /* -------------------- Ownership check -------------------- */
      const invalid = cartItems.find(item => item.user_id !== user_id);
      if (invalid) {
        throw new Error('Some cart items do not belong to you');
      }

      /* -------------------- Lock & validate stock -------------------- */
      for (const item of cartItems) {
        const stockRow = await this.warehouseStockModel.getStockForUpdate(
          item.product_id,
          item.warehouse_id,
          client
        );

        const availableQty = stockRow ? stockRow.quantity : 0;

        if (item.quantity > availableQty) {
          throw new Error(
            `Insufficient stock for "${item.product_name}" in warehouse ${item.warehouse_id}`
          );
        }
      }

      /* -------------------- Calculate total -------------------- */
      const total_amount = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      /* -------------------- Create order -------------------- */
      const order = await this.orderModel.createOrder({
        user_id,
        status: 'pending',
        total_amount,
        shipping_address,
        client
      });

      /* -------------------- Create payment -------------------- */
      const payment = await this.paymentModel.createPayment({
        user_id,
        amount: total_amount,
        method: payment_method,
        status: 'pending',
        client
      });

      await this.paymentModel.linkPaymentToOrder(
        order.id,
        payment.id,
        client
      );

      /* -------------------- Create order items -------------------- */
      for (const item of cartItems) {
        await this.orderItemModel.createOrderItem({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          warehouse_id: item.warehouse_id,
          client
        });
      }

      /* -------------------- Deduct warehouse stock -------------------- */
      for (const item of cartItems) {
        await this.warehouseStockModel.decreaseStock(
          item.product_id,
          item.warehouse_id,
          item.quantity,
          client
        );
      }

      /* -------------------- Clear cart -------------------- */
      for (const item of cartItems) {
        await this.cartModel.deleteCart(item.id, client);
      }

      /* -------------------- Finalize payment & order -------------------- */
      await this.paymentModel.updatePaymentStatus(payment.id, 'completed', client);

      await client.query(
        `UPDATE orders SET status = 'confirmed' WHERE id = $1`,
        [order.id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Checkout completed successfully',
        data: {
          order_id: order.id,
          payment_id: payment.id,
          total_amount,
          items: cartItems.map(i => ({
            product_name: i.product_name,
            quantity: i.quantity,
            price: i.price,
            warehouse_id: i.warehouse_id,
            subtotal: i.quantity * i.price
          }))
        }
      });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('💥 Checkout failed:', err.message);

      res.status(400).json({
        success: false,
        error: err.message
      });
    } finally {
      client.release();
    }
  }

  /* ============================================================
     OPTIONAL: PROCESS PAYMENT LATER (unchanged)
  ============================================================ */
  async processPayment(req, res, next) {
    try {
      const user_id = req.user.id;
      const { order_id, payment_method = 'card' } = req.body;

      const order = await this.orderModel.getOrderById(order_id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      if (order.user_id !== user_id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const payment = await this.paymentModel.createPayment({
        user_id,
        amount: order.total_amount,
        method: payment_method,
        status: 'pending'
      });

      await this.paymentModel.linkPaymentToOrder(order_id, payment.id);
      await this.paymentModel.updatePaymentStatus(payment.id, 'completed');
      await this.orderModel.updateOrder(order_id, { status: 'confirmed' });

      res.json({
        success: true,
        message: 'Payment processed',
        data: { order_id, payment_id: payment.id }
      });

    } catch (err) {
      next(err);
    }
  }
}

module.exports = CheckoutController;
