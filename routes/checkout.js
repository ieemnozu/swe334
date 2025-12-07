const express = require("express");
const authGuard = require("../middleware/authGuard");
const CheckoutController = require("../controller/checkout");

const router = express.Router();

router.post("/", authGuard, CheckoutController.checkout);

module.exports = router;
