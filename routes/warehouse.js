const express = require('express');
const authGuard = require('../middleware/authGuard');
const {requireRoles} = require('../middleware/roleGuard');
const WarehouseController = require('../controller/warehouse');
const Warehouse = require('../models/Warehouse');

const router = express.Router();
const warehouseController = new WarehouseController(new Warehouse());

// ✅ Public routes (accessible to all authenticated users)
router.route('/')
  .get(authGuard, warehouseController.getAllWarehouses.bind(warehouseController))
  .post(authGuard, requireRoles(30), warehouseController.createWarehouse.bind(warehouseController));

// ✅ Search warehouses (accessible to all authenticated users)
router.route('/search')
  .get(authGuard, warehouseController.searchWarehouses.bind(warehouseController));

// ✅ Admin-only routes (require role 30 - likely admin/manager)
router.route('/stats')
  .get(authGuard, requireRoles(30), warehouseController.getWarehousesWithStats.bind(warehouseController));

// ✅ Routes with ID parameter
router.route('/:id')
  .get(authGuard, warehouseController.getWarehouseById.bind(warehouseController))
  .put(authGuard, requireRoles(30), warehouseController.updateWarehouse.bind(warehouseController))
  .delete(authGuard, requireRoles(30), warehouseController.deleteWarehouse.bind(warehouseController));

// ✅ Warehouse stock details (admin only)
router.route('/:id/stock')
  .get(authGuard, requireRoles(30), warehouseController.getWarehouseWithStock.bind(warehouseController));

module.exports = router;