// controllers/checkout.js
const { pool } = require("../db");

class CheckoutController {
  static async checkout(req, res) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const userId = req.user.id;

      // 1️⃣ calculate total (your existing logic)
      const totalAmount = 100; // example

      // 2️⃣ create payment (PENDING ✅)
      const paymentRes = await client.query(
        `INSERT INTO payments (user_id, amount, status)
         VALUES ($1, $2, 'PENDING')
         RETURNING id`,
        [userId, totalAmount]
      );

      const paymentId = paymentRes.rows[0].id;

      // 3️⃣ create order (PENDING_PAYMENT ✅)
      const orderRes = await client.query(
        `INSERT INTO orders (user_id, payment_id, total_amount, status)
         VALUES ($1, $2, $3, 'PENDING_PAYMENT')
         RETURNING id`,
        [userId, paymentId, totalAmount]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Order created. Please complete payment.",
        orderId: orderRes.rows[0].id,
        paymentId,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Checkout error:", err);
      return res.status(500).json({ message: "Checkout failed" });
    } finally {
      client.release();
    }
  }
}

module.exports = CheckoutController;
