class ProductController {
  constructor(model) {
    this.model = model;
  }

  // 🟢 GET all products (with pagination)
  async getProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 10;

      const products = await this.model.getAllProducts({ limit, page });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (err) {
      next(err);
    }
  }

  // 🟢 GET product by ID
async getProductById(req, res, next) {
  try {
    const product = await this.model.getProductWithAttributes(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}


  // 🟢 CREATE product
  async createProduct(req, res, next) {
    try {
      const newProduct = await this.model.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

  // 🟢 UPDATE product
  async updateProduct(req, res, next) {
    try {
      const updatedProduct = await this.model.updateProduct(req.params.id, req.body);

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${req.params.id} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

  // 🟢 DELETE product
  async deleteProduct(req, res, next) {
    try {
      const deletedProduct = await this.model.deleteProduct(req.params.id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          error: `Product with ID ${req.params.id} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: deletedProduct,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
