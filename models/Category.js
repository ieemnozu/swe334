const { pool } = require('../db');

class Category {
    #tableName = 'categories';

    async getAllCategories() {
        const result = await pool.query(`SELECT * FROM ${this.#tableName}`);
        return result.rows;
    }

    async getCategoryById(id) {
        const result = await pool.query(`SELECT * FROM ${this.#tableName} WHERE id = $1`, [id]);
        return result.rows[0];
    }

    async createCategory(dto) {
        const { name, description, photo } = dto;
        const result = await pool.query(
            `INSERT INTO ${this.#tableName} (name, description, photo)
             VALUES ($1, $2, $3) RETURNING *`,
            [name, description, photo]
        );
        return result.rows[0];
    }

    async updateCategory(id, dto) {
        const { name, description, photo } = dto;
        const result = await pool.query(
            `UPDATE ${this.#tableName}
             SET name = $1, description = $2, photo = $3
             WHERE id = $4 RETURNING *`,
            [name, description, photo, id]
        );
        return result.rows[0];
    }

    async deleteCategory(id) {
        const result = await pool.query(
            `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Category;
