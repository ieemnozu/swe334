const express = require("express");
require("dotenv").config();

const { connectDB } = require("./db");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");
// Routes
const categoriesRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");
const appRoutes = require("./routes/app");
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brand");
const cartRoutes = require("./routes/cart");
const discountRoutes = require("./routes/discount");
const orderItemRoutes = require("./routes/orderitem");
const checkoutRoutes = require("./routes/checkout");
const warehouseRoutes = require("./routes/warehouse");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ✅ Routes
app.use("/api", appRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Error handler must be LAST
app.use(errorHandler);

// ✅ Start server only after DB connects
(async () => {
  try {
    await connectDB();
    console.log("Connected to the database");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
