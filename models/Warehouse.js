const { pool } = require('../db');

class Warehouse {
  #tableName = 'warehouses';

  // ✅ Create a new warehouse
  async createWarehouse({ name, location }) {
    if (!name || !location) {
      throw new Error('All fields (name, location) are required');
    }

    const result = await pool.query(
      `INSERT INTO ${this.#tableName} (name, location, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [name, location]
    );

    return result.rows[0];
  }

  // ✅ Get all warehouses
  async getAllWarehouses() {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // ✅ Get warehouse by ID
  async getWarehouseById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // ✅ Update warehouse
  async updateWarehouse(id, { name, location }) {
    const result = await pool.query(
      `UPDATE ${this.#tableName}
       SET name = COALESCE($1, name),
           location = COALESCE($2, location),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, location, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Warehouse not found');
    }

    return result.rows[0];
  }

  // ✅ Delete warehouse
  async deleteWarehouse(id) {
    // Check if warehouse exists
    const existing = await this.getWarehouseById(id);
    if (!existing) {
      throw new Error('Warehouse not found');
    }

    // Check if warehouse has stock before deletion
    const stockCheck = await pool.query(
      `SELECT COUNT(*) as stock_count FROM warehouse_stock WHERE warehouse_id = $1`,
      [id]
    );

    if (parseInt(stockCheck.rows[0].stock_count) > 0) {
      throw new Error('Cannot delete warehouse with existing stock. Transfer or remove stock first.');
    }

    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0];
  }

  // ✅ Get warehouse with stock information
  async getWarehouseWithStock(id) {
    const warehouse = await this.getWarehouseById(id);
    if (!warehouse) return null;

    const stockResult = await pool.query(
      `SELECT ws.*, p.name as product_name, p.price
       FROM warehouse_stock ws
       JOIN products p ON ws.product_id = p.id
       WHERE ws.warehouse_id = $1
       ORDER BY p.name`,
      [id]
    );

    return {
      ...warehouse,
      stock: stockResult.rows
    };
  }

  // ✅ Get all warehouses with their total stock value
  async getWarehousesWithStats() {
    const result = await pool.query(
      `SELECT w.*, 
              COUNT(ws.product_id) as product_count,
              COALESCE(SUM(ws.quantity), 0) as total_items,
              COALESCE(SUM(ws.quantity * p.price), 0) as total_value
       FROM warehouses w
       LEFT JOIN warehouse_stock ws ON w.id = ws.warehouse_id
       LEFT JOIN products p ON ws.product_id = p.id
       GROUP BY w.id
       ORDER BY w.created_at DESC`
    );
    return result.rows;
  }

  // ✅ Search warehouses by name or location
  async searchWarehouses(query) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName}
       WHERE name ILIKE $1 OR location ILIKE $1
       ORDER BY name`,
      [`%${query}%`]
    );
    return result.rows;
  }
}

module.exports = Warehouse;