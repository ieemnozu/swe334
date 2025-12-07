// models/Payment.js
const { pool } = require('../db');

class Payment {
  #tableName = 'payments';
  #orderPaymentTable = 'order_payment';

  // ✅ Create a new payment
  async createPayment({ user_id, amount, method, status = 'pending' }) {
    if (!user_id || !amount || !method) {
      throw new Error('All fields (user_id, amount, method) are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const result = await pool.query(
      `INSERT INTO ${this.#tableName} (user_id, amount, method, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [user_id, amount, method, status]
    );

    return result.rows[0];
  }

  // ✅ Link payment to order
  async linkPaymentToOrder(order_id, payment_id) {
    if (!order_id || !payment_id) {
      throw new Error('Order ID and Payment ID are required');
    }

    const result = await pool.query(
      `INSERT INTO ${this.#orderPaymentTable} (order_id, payment_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [order_id, payment_id]
    );

    return result.rows[0];
  }

  // ✅ Get payment by ID
  async getPaymentById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // ✅ Get payments by user ID
  async getPaymentsByUserId(user_id) {
    const result = await pool.query(
      `SELECT p.*, op.order_id
       FROM ${this.#tableName} p
       LEFT JOIN ${this.#orderPaymentTable} op ON p.id = op.payment_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [user_id]
    );
    return result.rows;
  }

  // ✅ Get all payments (admin)
  async getAllPayments() {
    const result = await pool.query(
      `SELECT p.*, u.username, op.order_id
       FROM ${this.#tableName} p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN ${this.#orderPaymentTable} op ON p.id = op.payment_id
       ORDER BY p.created_at DESC`
    );
    return result.rows;
  }

  // ✅ Update payment status
  async updatePaymentStatus(id, status) {
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const result = await pool.query(
      `UPDATE ${this.#tableName}
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Payment not found');
    }

    return result.rows[0];
  }

  // ✅ Get payment with order details
  async getPaymentWithOrder(payment_id) {
    const result = await pool.query(
      `SELECT p.*, op.order_id, o.total_amount, o.status as order_status
       FROM ${this.#tableName} p
       LEFT JOIN ${this.#orderPaymentTable} op ON p.id = op.payment_id
       LEFT JOIN orders o ON op.order_id = o.id
       WHERE p.id = $1`,
      [payment_id]
    );
    return result.rows[0];
  }

  // ✅ Get payments by status
  async getPaymentsByStatus(status) {
    const result = await pool.query(
      `SELECT p.*, u.username, op.order_id
       FROM ${this.#tableName} p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN ${this.#orderPaymentTable} op ON p.id = op.payment_id
       WHERE p.status = $1
       ORDER BY p.created_at DESC`,
      [status]
    );
    return result.rows;
  }

  // ✅ Delete payment (admin only)
  async deletePayment(id) {
    // First check if payment exists
    const existing = await this.getPaymentById(id);
    if (!existing) {
      throw new Error('Payment not found');
    }

    // Delete from order_payment first (due to foreign key)
    await pool.query(
      `DELETE FROM ${this.#orderPaymentTable} WHERE payment_id = $1`,
      [id]
    );

    // Then delete the payment
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0];
  }
}

module.exports = Payment;