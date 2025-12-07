// models/WarehouseStock.js

class WarehouseStock {
  async getStockForUpdate(product_id, warehouse_id, client) {
    const res = await client.query(
      `
      SELECT quantity
      FROM warehouse_stock
      WHERE product_id = $1 AND warehouse_id = $2
      FOR UPDATE
      `,
      [product_id, warehouse_id]
    );
    return res.rows[0];
  }

  async decreaseStock(product_id, warehouse_id, quantity, client) {
    await client.query(
      `
      UPDATE warehouse_stock
      SET quantity = quantity - $3
      WHERE product_id = $1 AND warehouse_id = $2
      `,
      [product_id, warehouse_id, quantity]
    );
  }
}

module.exports = WarehouseStock;
