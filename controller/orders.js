// controller/order.js
class OrdersController {
  constructor(OrdersModel) {
    this.Orders = OrdersModel;
  }

  // ✅ Create a new order for the current user
  async createOrder(req, res) {
    try {
      const user_id = req.user.id; // assumes authGuard sets req.user
      const { status, total_amount, shipping_address, payment_id } = req.body;

      if (!status || !total_amount || !shipping_address) {
        return res.status(400).json({
          message: 'status, total_amount, shipping_address are required',
        });
      }

      const order = await this.Orders.createOrder({
        user_id,
        status,
        total_amount,
        shipping_address,
        payment_id: payment_id || null,
      });

      return res.status(201).json(order);
    } catch (err) {
      console.error('createOrder error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // ✅ Admin: get all orders
  async getAllOrders(req, res) {
    try {
      const orders = await this.Orders.getAllOrders();
      return res.json(orders);
    } catch (err) {
      console.error('getAllOrders error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // ✅ Current user's orders
  async getMyOrders(req, res) {
    try {
      const user_id = req.user.id;
      const orders = await this.Orders.getOrdersByUserId(user_id);
      return res.json(orders);
    } catch (err) {
      console.error('getMyOrders error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // ✅ Get order by ID (owner or admin)
  async getOrderById(req, res) {
    try {
      const id = req.params.id;
      const order = await this.Orders.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const isOwner = order.user_id == req.user.id;
      const isAdmin = req.user.role == 30; // adjust if needed

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Эрх хүрэлцэхгүй байна' });
      }

      return res.json(order);
    } catch (err) {
      console.error('getOrderById error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // ✅ Update order (owner or admin)
  async updateOrder(req, res) {
    try {
      const id = req.params.id;
      const { status, shipping_address, payment_id } = req.body;

      const existing = await this.Orders.getOrderById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const isOwner = existing.user_id == req.user.id;
      const isAdmin = req.user.role == 30;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Эрх хүрэлцэхгүй байна' });
      }

      const updated = await this.Orders.updateOrder(id, {
        status,
        shipping_address,
        payment_id,
      });

      return res.json(updated);
    } catch (err) {
      console.error('updateOrder error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }

  // ✅ Delete order (admin only – router enforces role)
  async deleteOrder(req, res) {
    try {
      const id = req.params.id;
      const deleted = await this.Orders.deleteOrder(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.json({ message: 'Order deleted', order: deleted });
    } catch (err) {
      console.error('deleteOrder error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
  async filterOrders(req, res) {
    try {
      const {
        statuses,
        from_date,
        to_date,
        min_amount,
        max_amount,
        warehouse_id
      } = req.body;

      // Basic validation & normalization
      let normStatuses = Array.isArray(statuses) ? statuses : [];

      const filters = {
        statuses: normStatuses,
        from_date,
        to_date,
        min_amount,
        max_amount,
        warehouse_id
      };

      const orders = await this.Orders.filterOrders(filters);

      return res.json({
        success: true,
        count: orders.length,
        filters,
        data: orders
      });
    } catch (err) {
      console.error('filterOrders error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
  }
}

module.exports = OrdersController;
