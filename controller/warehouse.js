const Warehouse = require('../models/Warehouse');

class WarehouseController {
  constructor(warehouseModel) {
    this.warehouseModel = warehouseModel;
  }

  async createWarehouse(req, res, next) {
    try {
      const { name, location } = req.body;
      if (!name || !location) {
        return res.status(400).json({
          success: false,
          error: 'Name and location are required'
        });
      }
      const warehouse = await this.warehouseModel.createWarehouse({ name, location });
      res.status(201).json({
        success: true,
        message: 'Warehouse created successfully',
        data: { warehouse }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllWarehouses(req, res, next) {
    try {
      const warehouses = await this.warehouseModel.getAllWarehouses();
      res.json({
        success: true,
        data: { warehouses }
      });
    } catch (err) {
      next(err);
    }
  }

  async getWarehouseById(req, res, next) {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseModel.getWarehouseById(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          error: 'Warehouse not found'
        });
      }
      res.json({
        success: true,
        data: { warehouse }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateWarehouse(req, res, next) {
    try {
      const { id } = req.params;
      const { name, location } = req.body;
      const warehouse = await this.warehouseModel.updateWarehouse(id, { name, location });
      res.json({
        success: true,
        message: 'Warehouse updated successfully',
        data: { warehouse }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteWarehouse(req, res, next) {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseModel.deleteWarehouse(id);
      res.json({
        success: true,
        message: 'Warehouse deleted successfully',
        data: { warehouse }
      });
    } catch (err) {
      next(err);
    }
  }

  async getWarehouseWithStock(req, res, next) {
    try {
      const { id } = req.params;
      const warehouse = await this.warehouseModel.getWarehouseWithStock(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          error: 'Warehouse not found'
        });
      }
      res.json({
        success: true,
        data: { warehouse }
      });
    } catch (err) {
      next(err);
    }
  }

  async getWarehousesWithStats(req, res, next) {
    try {
      const warehouses = await this.warehouseModel.getWarehousesWithStats();
      res.json({
        success: true,
        data: { warehouses }
      });
    } catch (err) {
      next(err);
    }
  }

  async searchWarehouses(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      const warehouses = await this.warehouseModel.searchWarehouses(q);
      res.json({
        success: true,
        data: { warehouses }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WarehouseController;