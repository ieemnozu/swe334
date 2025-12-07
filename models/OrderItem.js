const { pool } = require('../db');

class OrderItem {
  #tableName = 'order_items';

  // ✅ Get all order items
  async getAllOrderItems() {
    const result = await pool.query(`SELECT * FROM ${this.#tableName} ORDER BY id`);
    return result.rows;
  }

  // ✅ Get order item by ID
  async getOrderItemById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // ✅ Get order items by order ID
  async getOrderItemsByOrderId(orderId) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE order_id = $1`,
      [orderId]
    );
    return result.rows;
  }

  // ✅ Create a new order item
  async createOrderItem(dto) {
    const { order_id, product_id, quantity, price } = dto;

    // Validation
    if (!order_id || !product_id || !quantity || !price) {
      const err = new Error('All fields (order_id, product_id, quantity, price) are required');
      err.status = 400;
      throw err;
    }

    if (quantity <= 0) {
      const err = new Error('Quantity must be greater than 0');
      err.status = 400;
      throw err;
    }

    if (price <= 0) {
      const err = new Error('Price must be greater than 0');
      err.status = 400;
      throw err;
    }

    const result = await pool.query(
      `INSERT INTO ${this.#tableName} (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, product_id, quantity, price]
    );

    return result.rows[0];
  }

  // ✅ Update order item
  async updateOrderItem(id, dto) {
    const existing = await this.getOrderItemById(id);
    if (!existing) {
      const err = new Error('Order item not found');
      err.status = 404;
      throw err;
    }

    const { order_id, product_id, quantity, price } = dto;

    const result = await pool.query(
      `UPDATE ${this.#tableName}
       SET order_id = COALESCE($1, order_id),
           product_id = COALESCE($2, product_id),
           quantity = COALESCE($3, quantity),
           price = COALESCE($4, price)
       WHERE id = $5
       RETURNING *`,
      [order_id, product_id, quantity, price, id]
    );

    return result.rows[0];
  }

  // ✅ Delete order item
  async deleteOrderItem(id) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = OrderItem;
  