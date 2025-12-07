const { pool } = require('../db');

class Product {
  #tableName = 'products';

  /* =====================================================================
     BRAND & CATEGORY HELPERS
     - Use names from body
     - Find or create in brands/categories table
     - Return { id, name }
  ===================================================================== */

  async getOrCreateBrand(client, brand_name) {
    try {
      if (!brand_name || !brand_name.trim()) {
        throw new Error('brand_name is required');
      }

      const name = brand_name.trim();

      // Check existing brand (case-insensitive)
      const existing = await client.query(
        `SELECT id, name 
         FROM brands 
         WHERE LOWER(name) = LOWER($1)`,
        [name]
      );

      if (existing.rowCount > 0) {
        return existing.rows[0]; // { id, name }
      }

      // Insert new brand
      const inserted = await client.query(
        `INSERT INTO brands (name) 
         VALUES ($1) 
         RETURNING id, name`,
        [name]
      );

      return inserted.rows[0];
    } catch (error) {
      throw new Error(`Brand creation failed: ${error.message}`);
    }
  }

  async getOrCreateCategory(client, category_name) {
    try {
      if (!category_name || !category_name.trim()) {
        throw new Error('category_name is required');
      }

      const name = category_name.trim();

      const existing = await client.query(
        `SELECT id, name 
         FROM categories 
         WHERE LOWER(name) = LOWER($1)`,
        [name]
      );

      if (existing.rowCount > 0) {
        return existing.rows[0]; // { id, name }
      }

      const inserted = await client.query(
        `INSERT INTO categories (name) 
         VALUES ($1) 
         RETURNING id, name`,
        [name]
      );

      return inserted.rows[0];
    } catch (error) {
      throw new Error(`Category creation failed: ${error.message}`);
    }
  }

  /* =====================================================================
     HELPER: ATTRIBUTES (YOUR VERSION, CLEANED UP)
     - Keeps normalized schema:
       attributes, attribute_values, product_attributes
  ===================================================================== */

  async getOrCreateAttributeIds(client, attributeName, valueName, category_id) {
    try {
      // Validate inputs
      if (!attributeName || !valueName || !category_id) {
        throw new Error('Attribute name, value, and category ID are required');
      }

      // 1️⃣ Attribute
      let attribute = await client.query(
        `SELECT id 
         FROM attributes 
         WHERE name = $1 AND category_id = $2`,
        [attributeName, category_id]
      );

      let attribute_id;
      if (attribute.rowCount === 0) {
        const newA = await client.query(
          `INSERT INTO attributes (name, category_id) 
           VALUES ($1, $2) 
           RETURNING id`,
          [attributeName, category_id]
        );
        attribute_id = newA.rows[0].id;
      } else {
        attribute_id = attribute.rows[0].id;
      }

      // 2️⃣ Attribute value
      let value = await client.query(
        `SELECT id 
         FROM attribute_values 
         WHERE attribute_id = $1 AND value = $2`,
        [attribute_id, valueName]
      );

      let attribute_value_id;
      if (value.rowCount === 0) {
        const newV = await client.query(
          `INSERT INTO attribute_values (attribute_id, value) 
           VALUES ($1, $2) 
           RETURNING id`,
          [attribute_id, valueName]
        );
        attribute_value_id = newV.rows[0].id;
      } else {
        attribute_value_id = value.rows[0].id;
      }

      return { attribute_id, attribute_value_id };
    } catch (error) {
      throw new Error(`Attribute creation failed: ${error.message}`);
    }
  }

  /* =====================================================================
     HELPER: WAREHOUSE STOCK
  ===================================================================== */

  async upsertWarehouseStock(client, product_id, warehouse_id, quantity) {
    if (!warehouse_id) return;

    const existing = await client.query(
      `SELECT id 
       FROM warehouse_stock 
       WHERE product_id = $1 AND warehouse_id = $2`,
      [product_id, warehouse_id]
    );

    if (existing.rowCount > 0) {
      await client.query(
        `UPDATE warehouse_stock
         SET quantity = $3
         WHERE product_id = $1 AND warehouse_id = $2`,
        [product_id, warehouse_id, quantity]
      );
    } else {
      await client.query(
        `INSERT INTO warehouse_stock (product_id, warehouse_id, quantity)
         VALUES ($1, $2, $3)`,
        [product_id, warehouse_id, quantity]
      );
    }
  }

  /* =====================================================================
     CREATE PRODUCT
     - Uses brand_name & category_name from body
     - Finds/creates brand & category
     - Inserts their IDs + names into products
     - Uses normalized attributes
     - Sets warehouse_stock
  ===================================================================== */

  async createProduct(dto) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        brand_name,
        category_name,
        name,
        quantity,               // pieces per unit
        type,
        price,
        size,
        status,
        warehouse_id,
        warehouse_quantity,     // units / boxes in that warehouse
        attributes = []
      } = dto;

      /* -------- Validation -------- */
      if (!name) throw new Error('Product name is required');
      if (!brand_name) throw new Error('brand_name is required');
      if (!category_name) throw new Error('category_name is required');
      if (!status) throw new Error('Status is required');
      if (!warehouse_id) throw new Error('warehouse_id is required');

      if (price == null || price <= 0) {
        throw new Error('Price must be greater than zero');
      }
      if (quantity == null || quantity <= 0) {
        throw new Error('quantity (pieces per unit) must be > 0');
      }
      if (warehouse_quantity == null || warehouse_quantity < 0) {
        throw new Error('warehouse_quantity must be >= 0');
      }

      /* -------- Duplicate product name check -------- */
      const exists = await client.query(
        `SELECT id 
         FROM ${this.#tableName} 
         WHERE LOWER(name) = LOWER($1)`,
        [name]
      );
      if (exists.rowCount > 0) {
        throw new Error('Product already exists');
      }

      /* -------- Brand & Category (ID + name) -------- */
      const brand = await this.getOrCreateBrand(client, brand_name);
      const category = await this.getOrCreateCategory(client, category_name);
      // brand: { id, name }
      // category: { id, name }

      /* -------- Insert product -------- */
      const product = (
        await client.query(
          `INSERT INTO ${this.#tableName}
            (brand_id, brand_name,
             category_id, category_name,
             name, quantity, type, price, size, status, created_at)
           VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
           RETURNING *`,
          [
            brand.id,
            brand.name,
            category.id,
            category.name,
            name,
            quantity,
            type,
            price,
            size,
            status
          ]
        )
      ).rows[0];

      /* -------- Warehouse stock -------- */
      await this.upsertWarehouseStock(
        client,
        product.id,
        warehouse_id,
        warehouse_quantity
      );

      /* -------- Attributes (normalized) -------- */
      for (const att of attributes) {
        if (!att.attribute || !att.value) continue;

        const { attribute_id, attribute_value_id } =
          await this.getOrCreateAttributeIds(
            client,
            att.attribute,
            att.value,
            category.id      // use category.id for attribute grouping
          );

        await client.query(
          `INSERT INTO product_attributes
             (product_id, attribute_id, attribute_value_id)
           VALUES ($1, $2, $3)`,
          [product.id, attribute_id, attribute_value_id]
        );
      }

      await client.query('COMMIT');
      return product;

    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Product creation failed: ${err.message}`);
    } finally {
      client.release();
    }
  }

  /* =====================================================================
     GET ALL PRODUCTS (WITH TOTAL STOCK)
  ===================================================================== */

  async getAllProducts(limit = 50, offset = 0) {
    const res = await pool.query(
      `SELECT
         p.*,
         COALESCE(SUM(ws.quantity), 0) AS total_stock
       FROM ${this.#tableName} p
       LEFT JOIN warehouse_stock ws ON ws.product_id = p.id
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.rows;
  }

  /* =====================================================================
     DELETE PRODUCT (cleans warehouse & attributes)
  ===================================================================== */

  async deleteProduct(id) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `DELETE FROM warehouse_stock WHERE product_id = $1`,
        [id]
      );

      await client.query(
        `DELETE FROM product_attributes WHERE product_id = $1`,
        [id]
      );

      const res = await client.query(
        `DELETE FROM ${this.#tableName} 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      if (res.rowCount === 0) {
        throw new Error('Product not found');
      }

      await client.query('COMMIT');
      return res.rows[0];

    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Product deletion failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

module.exports = Product;
