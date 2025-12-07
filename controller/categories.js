const Category = require("../models/Category");

class CategoryController {
  constructor(model) {
    this.model = model;
  }

  // 🟢 GET all categories
  async getCategories(req, res, next) {
    try {
      console.log('start');
      const categories = await this.model.getAllCategories();
      console.log(categories);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // 🟢 GET category by ID
  async getCategoryById(req, res, next) {
    try {
      const category = await this.model.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: `Category with ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // 🟢 CREATE category
  async createCategory(req, res, next) {
    try {
      const category = await this.model.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // 🟢 UPDATE category
  async updateCategory(req, res, next) {
    try {
      const category = await this.model.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: `Category with ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // 🟢 DELETE category
  async deleteCategory(req, res, next) {
    try {
      const category = await this.model.deleteCategory(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: `Category with ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
