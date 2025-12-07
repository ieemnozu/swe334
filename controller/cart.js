class CartController {
  constructor(model) {
    this.model = model;
  }

  // ✅ Get all cart items (admin only - consider adding role check)
  async getCarts(req, res, next) {
    try {
      const carts = await this.model.getAllCarts();
      res.status(200).json({
        success: true,
        data: carts
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Get current user's cart (secure alternative to getCartByUserId)
  async getMyCart(req, res, next) {
    try {
      const user_id = req.user_id; // From authGuard
      const carts = await this.model.getCartByUserId(user_id);
      
      res.status(200).json({
        success: true,
        data: carts
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Clear current user's cart (secure alternative to clearCartByUser)
  async clearMyCart(req, res, next) {
    try {
      const user_id = req.user_id; // From authGuard
      const clearedItems = await this.model.clearCartByUser(user_id);
      
      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: clearedItems
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Get a single cart item by ID (with ownership check)
  async getCartById(req, res, next) {
    try {
      const cart = await this.model.getCartById(req.params.id);
      if (!cart) {
        return res.status(404).json({
          success: false,
          error: `Cart item with ID ${req.params.id} not found`
        });
      }

      // ✅ SECURITY: Check if cart item belongs to current user
      if (cart.user_id !== req.user_id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - this cart item does not belong to you'
        });
      }

      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ Create a new cart item (automatically sets user_id from auth)
  async createCart(req, res, next) {
    try {
      const cartData = {
        ...req.body,
        user_id: req.user_id  // From authGuard middleware
      };

      const newCart = await this.model.createCart(cartData);
      res.status(201).json({
        success: true,
        message: 'Cart item added successfully',
        data: newCart
      });
    } catch (err) {
      res.status(err.status || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Update an existing cart item (with ownership check)
  async updateCart(req, res, next) {
    try {
      const cartId = req.params.id;
      
      // ✅ SECURITY: First check if cart item exists and belongs to user
      const existingCart = await this.model.getCartById(cartId);
      if (!existingCart) {
        return res.status(404).json({
          success: false,
          error: `Cart item with ID ${cartId} not found`
        });
      }

      if (existingCart.user_id !== req.user_id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - you can only update your own cart items'
        });
      }

      const updatedCart = await this.model.updateCart(cartId, req.body);
      res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: updatedCart
      });
    } catch (err) {
      res.status(err.status || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Delete a single cart item (with ownership check)
  async deleteCart(req, res, next) {
    try {
      const cartId = req.params.id;
      
      // ✅ SECURITY: First check if cart item exists and belongs to user
      const existingCart = await this.model.getCartById(cartId);
      if (!existingCart) {
        return res.status(404).json({
          success: false,
          error: `Cart item with ID ${cartId} not found`
        });
      }

      if (existingCart.user_id !== req.user_id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - you can only delete your own cart items'
        });
      }

      const deletedCart = await this.model.deleteCart(cartId);
      res.status(200).json({
        success: true,
        message: 'Cart item deleted successfully',
        data: deletedCart
      });
    } catch (err) {
      next(err);
    }
  }

  // ❌ REMOVED: getCartByUserId - Use getMyCart instead
  // ❌ REMOVED: clearCartByUser - Use clearMyCart instead
}

module.exports = CartController;