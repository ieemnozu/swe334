const { pool } = require('../db');

class Discount {
  #tableName = 'discount';

  // ✅ Get all discounts
  async getAllDiscounts() {
    const result = await pool.query(`SELECT * FROM ${this.#tableName} ORDER BY id`);
    return result.rows;
  }

  // ✅ Get discount by ID
  async getDiscountById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // ✅ Get discount by promotion name
  async getDiscountByPromotion(promotion) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE promotion = $1`,
      [promotion]
    );
    return result.rows[0];
  }

  // ✅ Create a new discount
  async createDiscount(dto) {
    const { percent, promotion, start_date, end_date } = dto;

    // Validation
    if (!percent || !promotion || !start_date || !end_date) {
      const err = new Error('All fields (percent, promotion, start_date, end_date) are required');
      err.status = 400;
      throw err;
    }

    if (percent <= 0 || percent > 100) {
      const err = new Error('Percent must be between 0 and 100');
      err.status = 400;
      throw err;
    }

    // Check for duplicate promotion name
    const existing = await this.getDiscountByPromotion(promotion);
    if (existing) {
      const err = new Error('A discount with this promotion name already exists');
      err.status = 400;
      throw err;
    }

    const result = await pool.query(
      `INSERT INTO ${this.#tableName} (percent, promotion, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [percent, promotion, start_date, end_date]
    );

    return result.rows[0];
  }

  // ✅ Update discount
  async updateDiscount(id, dto) {
    const existing = await this.getDiscountById(id);
    if (!existing) {
      const err = new Error('Discount not found');
      err.status = 404;
      throw err;
    }

    const { percent, promotion, start_date, end_date } = dto;

    const result = await pool.query(
      `UPDATE ${this.#tableName}
       SET percent = COALESCE($1, percent),
           promotion = COALESCE($2, promotion),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date)
       WHERE id = $5
       RETURNING *`,
      [percent, promotion, start_date, end_date, id]
    );

    return result.rows[0];
  }

  // ✅ Delete discount
  async deleteDiscount(id) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Discount;
