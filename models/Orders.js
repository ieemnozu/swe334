// models/Order.js
const { pool } = require('../db');

class Orders {
  #tableName = 'orders';

  // ✅ Create a new order
  async createOrder({ user_id, status, total_amount, shipping_address, payment_id = null }) {
    if (!user_id || !status || !total_amount || !shipping_address) {
      throw new Error('All fields (user_id, status, total_amount, shipping_address) are required');
    }

    const result = await pool.query(
      `INSERT INTO ${this.#tableName} 
        (user_id, status, total_amount, shipping_address, payment_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [user_id, status, total_amount, shipping_address, payment_id]
    );

    return result.rows[0];
  }

  // ✅ Get all orders
  async getAllOrders() {
    const result = await pool.query(`SELECT * FROM ${this.#tableName} ORDER BY created_at DESC`);
    return result.rows;
  }

  // ✅ Get order by ID
  async getOrderById(id) {
    const result = await pool.query(`SELECT * FROM ${this.#tableName} WHERE id = $1`, [id]);
    return result.rows[0];
  }

  // ✅ Get orders by user ID
  async getOrdersByUserId(user_id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  }

  // ✅ Update order (status, shipping address, payment_id)
  async updateOrder(id, { status, shipping_address, payment_id }) {
    const result = await pool.query(
      `UPDATE ${this.#tableName} 
       SET status = COALESCE($1, status),
           shipping_address = COALESCE($2, shipping_address),
           payment_id = COALESCE($3, payment_id),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, shipping_address, payment_id, id]
    );
    return result.rows[0];
  }

  // ✅ Delete order
  async deleteOrder(id) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
  async filterOrders({ statuses, from_date, to_date, min_amount, max_amount, warehouse_id }) {
    const where = [];
    const params = [];
    let idx = 1;

    if (Array.isArray(statuses) && statuses.length > 0) {
      where.push(`status = ANY($${idx}::text[])`);
      params.push(statuses);
      idx++;
    }

    if (from_date) {
      where.push(`created_at >= $${idx}`);
      params.push(from_date);
      idx++;
    }

    if (to_date) {
      where.push(`created_at <= $${idx}`);
      params.push(to_date);
      idx++;
    }

    if (min_amount != null) {
      where.push(`total_amount >= $${idx}`);
      params.push(min_amount);
      idx++;
    }

    if (max_amount != null) {
      where.push(`total_amount <= $${idx}`);
      params.push(max_amount);
      idx++;
    }

    if (warehouse_id != null) {
      // assumes orders.warehouse_id exists
      where.push(`warehouse_id = $${idx}`);
      params.push(warehouse_id);
      idx++;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT *
       FROM ${this.#tableName}
       ${whereSql}
       ORDER BY created_at DESC`,
      params
    );

    return result.rows;
  }
}

module.exports = Orders;
