const {pool} = require('../db');

class Brand {
  #tableName = 'brands';
  async getAllBrands() {
    const result = await pool.query(`SELECT * FROM ${this.#tableName}`);
    return result.rows;
  }
    async getBrandById(id) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE id = $1`, 
      [id]
    );
    return result.rows[0];
  }
  async getBrandByName(name) {
    const result = await pool.query(
      `SELECT * FROM ${this.#tableName} WHERE name = $1`,
      [name]
    );
    return result.rows[0];
  }
    async createBrand(dto) {
  const { name } = dto;

  const brand = await this.getBrandByName(name);
  if (brand) {
    throw new Error('Brand with this name already exists');
  }

  const result = await pool.query(
    `INSERT INTO ${this.#tableName} (name, created_at)
     VALUES ($1, NOW())
     RETURNING *`,
    [name]
  );

  return result.rows[0];
}

    async updateBrand(id, dto) {
        const existingBrand = await this.getBrandById(id);
        if (!existingBrand) {
          const err =  new Error('Brand not found');
          err.status = 404;
          throw err;
        } 

        const { name } = dto;
        const result = await pool.query(
            `UPDATE ${this.#tableName}
             SET name = COALESCE($1, name)
             WHERE id = $2
             RETURNING *`,
            [name, id]
        );
        return result.rows[0];
    }
    async deleteBrand(id) {
        const result = await pool.query(
            `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Brand;
