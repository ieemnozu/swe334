class DiscountController {
  constructor(model) {
    this.model = model;
  }

  // ✅ Get all discounts
  async getDiscounts(req, res, next) {
    try {
      const discounts = await this.model.getAllDiscounts();
      res.status(200).json({
        success: true,
        data: discounts
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Get discount by ID
  async getDiscountById(req, res, next) {
    try {
      const discount = await this.model.getDiscountById(req.params.id);
      if (!discount) {
        return res.status(404).json({
          success: false,
          error: `Discount with ID ${req.params.id} not found`
        });
      }
      res.status(200).json({
        success: true,
        data: discount
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Create discount
  async createDiscount(req, res, next) {
    try {
      const newDiscount = await this.model.createDiscount(req.body);
      res.status(201).json({
        success: true,
        message: 'Discount created successfully',
        data: newDiscount
      });
    } catch (err) {
      res.status(err.status || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Update discount
  async updateDiscount(req, res, next) {
    try {
      const updated = await this.model.updateDiscount(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Discount with ID ${req.params.id} not found`
        });
      }
      res.status(200).json({
        success: true,
        message: 'Discount updated successfully',
        data: updated
      });
    } catch (err) {
      res.status(err.status || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Delete discount
  async deleteDiscount(req, res, next) {
    try {
      const deleted = await this.model.deleteDiscount(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Discount with ID ${req.params.id} not found`
        });
      }
      res.status(200).json({
        success: true,
        message: 'Discount deleted successfully',
        data: deleted
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DiscountController;
