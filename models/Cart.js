const { pool } = require('../db');

class Cart {
  #tableName = 'cart';

  /* =====================================================================
     GET ALL CART ITEMS (ADMIN)
  ===================================================================== */
  async getAllCarts() {
    const result = await pool.query(`
      SELECT
        c.*,
        p.name AS product_name,
        ws.quantity AS stock_quantity
      FROM ${this.#tableName} c
      JOIN products p ON c.product_id = p.id
      JOIN warehouse_stock ws
        ON ws.product_id = c.product_id
       AND ws.warehouse_id = c.warehouse_id
    `);
    return result.rows;
  }

  /* =====================================================================
     GET CART ITEM BY ID
  ===================================================================== */
  async getCartById(id) {
    const result = await pool.query(
      `
      SELECT
        c.*,
        p.name AS product_name,
        ws.quantity AS stock_quantity
      FROM ${this.#tableName} c
      JOIN products p ON c.product_id = p.id
      JOIN warehouse_stock ws
        ON ws.product_id = c.product_id
       AND ws.warehouse_id = c.warehouse_id
      WHERE c.id = $1
      `,
      [id]
    );
    return result.rows[0];
  }

  /* =====================================================================
     GET CART BY USER
  ===================================================================== */
  async getCartByUserId(user_id) {
    const result = await pool.query(
      `
      SELECT
        c.*,
        p.name AS product_name,
        ws.quantity AS stock_quantity
      FROM ${this.#tableName} c
      JOIN products p ON c.product_id = p.id
      JOIN warehouse_stock ws
        ON ws.product_id = c.product_id
       AND ws.warehouse_id = c.warehouse_id
      WHERE c.user_id = $1
      `,
      [user_id]
    );
    return result.rows;
  }

  /* =====================================================================
     GET SINGLE CART ITEM
  ===================================================================== */
  async getCartItem(user_id, product_id, warehouse_id) {
    const result = await pool.query(
      `
      SELECT
        c.*,
        p.name AS product_name,
        ws.quantity AS stock_quantity
      FROM ${this.#tableName} c
      JOIN products p ON c.product_id = p.id
      JOIN warehouse_stock ws
        ON ws.product_id = c.product_id
       AND ws.warehouse_id = c.warehouse_id
      WHERE c.user_id = $1
        AND c.product_id = $2
        AND c.warehouse_id = $3
      `,
      [user_id, product_id, warehouse_id]
    );
    return result.rows[0];
  }

  /* =====================================================================
     CREATE CART ITEM
  ===================================================================== */
  async createCart(dto) {
  const { user_id, product_id, quantity } = dto;

  if (!user_id || !product_id || !quantity) {
    const err = new Error(
      'Missing required fields: user_id, product_id, quantity'
    );
    err.status = 400;
    throw err;
  }

  // 1️⃣ Get product info
  const productRes = await pool.query(
    `SELECT id, name, price FROM products WHERE id = $1`,
    [product_id]
  );

  if (productRes.rowCount === 0) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  const { name: productName, price } = productRes.rows[0];

  // 2️⃣ Auto-pick warehouse with enough stock
  const stockRes = await pool.query(
    `
    SELECT warehouse_id, quantity
    FROM warehouse_stock
    WHERE product_id = $1
      AND quantity >= $2
    ORDER BY quantity DESC
    LIMIT 1
    `,
    [product_id, quantity]
  );

  if (stockRes.rowCount === 0) {
    const err = new Error(
      `Insufficient stock for "${productName}" in all warehouses`
    );
    err.status = 400;
    throw err;
  }

  const { warehouse_id, quantity: stockQuantity } = stockRes.rows[0];

  // 3️⃣ Prevent duplicate cart item
  const existing = await this.getCartItem(user_id, product_id, warehouse_id);
  if (existing) {
    const err = new Error(`"${productName}" is already in your cart`);
    err.status = 400;
    throw err;
  }

  // 4️⃣ Insert into cart
  const result = await pool.query(
    `
    INSERT INTO cart
      (user_id, product_id, warehouse_id, quantity, price, created_at)
    VALUES
      ($1, $2, $3, $4, $5, NOW())
    RETURNING *
    `,
    [user_id, product_id, warehouse_id, quantity, price]
  );

  return {
    ...result.rows[0],
    product_name: productName,
    stock_quantity: stockQuantity
  };
}


  /* =====================================================================
     UPDATE CART QUANTITY
  ===================================================================== */
  async updateCart(id, dto) {
    const existing = await this.getCartById(id);
    if (!existing) {
      const err = new Error('Cart item not found');
      err.status = 404;
      throw err;
    }

    const { quantity } = dto;
    if (quantity <= 0) {
      const err = new Error('Quantity must be greater than zero');
      err.status = 400;
      throw err;
    }

    if (quantity > existing.stock_quantity) {
      const err = new Error(
        `Only ${existing.stock_quantity} units available for "${existing.product_name}"`
      );
      err.status = 400;
      throw err;
    }

    const result = await pool.query(
      `
      UPDATE ${this.#tableName}
      SET quantity = $1
      WHERE id = $2
      RETURNING *
      `,
      [quantity, id]
    );

    return result.rows[0];
  }

  /* =====================================================================
     GET CART ITEMS FOR CHECKOUT
  ===================================================================== */
  async getCartItemsWithDetails(cartIds) {
    const result = await pool.query(
      `
      SELECT
        c.*,
        p.name AS product_name,
        ws.quantity AS stock_quantity
      FROM ${this.#tableName} c
      JOIN products p ON c.product_id = p.id
      JOIN warehouse_stock ws
        ON ws.product_id = c.product_id
       AND ws.warehouse_id = c.warehouse_id
      WHERE c.id = ANY($1)
      `,
      [cartIds]
    );
    return result.rows;
  }

  /* =====================================================================
     CART TOTAL
  ===================================================================== */
  async getCartTotal(user_id) {
    const result = await pool.query(
      `
      SELECT SUM(quantity * price) AS total
      FROM ${this.#tableName}
      WHERE user_id = $1
      `,
      [user_id]
    );
    return result.rows[0].total || 0;
  }

  /* =====================================================================
     DELETE CART ITEM
  ===================================================================== */
  async deleteCart(id) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  /* =====================================================================
     CLEAR USER CART
  ===================================================================== */
  async clearCartByUser(user_id) {
    const result = await pool.query(
      `DELETE FROM ${this.#tableName} WHERE user_id = $1 RETURNING *`,
      [user_id]
    );
    return result.rows;
  }
}

module.exports = Cart;
