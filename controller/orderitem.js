class OrderItemController {
  constructor(model) {
    this.model = model;
  }

  // ✅ Get all order items
  async getOrderItems(req, res, next) {
    try {
      const orderItems = await this.model.getAllOrderItems();
      res.status(200).json({ success: true, data: orderItems });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Get order item by ID
  async getOrderItemById(req, res, next) {
    try {
      const orderItem = await this.model.getOrderItemById(req.params.id);
      if (!orderItem) {
        return res.status(404).json({
          success: false,
          error: `Order item with ID ${req.params.id} not found`
        });
      }
      res.status(200).json({ success: true, data: orderItem });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Get items by order ID
  async getOrderItemsByOrderId(req, res, next) {
    try {
      const orderItems = await this.model.getOrderItemsByOrderId(req.params.orderId);
      res.status(200).json({ success: true, data: orderItems });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Create order item
  async createOrderItem(req, res, next) {
    try {
      const newOrderItem = await this.model.createOrderItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Order item created successfully',
        data: newOrderItem
      });
    } catch (err) {
      res.status(err.status || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Update order item
  async updateOrderItem(req, res, next) {
    try {
      const updated = await this.model.updateOrderItem(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: `Order item with ID ${req.params.id} not found`
        });
      }
      res.status(200).json({
        success: true,
        message: 'Order item updated successfully',
        data: updated
      });
    } catch (err) {
      res.status(err.status || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Delete order item
  async deleteOrderItem(req, res, next) {
    try {
      const deleted = await this.model.deleteOrderItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: `Order item with ID ${req.params.id} not found`
        });
      }
      res.status(200).json({
        success: true,
        message: 'Order item deleted successfully',
        data: deleted
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderItemController;
