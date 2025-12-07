class BrandController {
    constructor(model) {
        this.model = model;
    }

    async getBrands(req, res, next) {
        try {
            const brands = await this.model.getAllBrands();
            res.status(200).json({
                success: true,
                data: brands
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getBrandById(req, res, next) {
        try {
            const brand = await this.model.getBrandById(req.params.id);
            if (!brand) {
                return res.status(404).json({
                    success: false,
                    error: `Brand with ID ${req.params.id} not found`
                });
            }
            res.status(200).json({
                success: true,
                data: brand
            });
        }
        catch (err) {
            next(err);
        }
    }

    async createBrand(req, res, next) {
        try {
            const newBrand = await this.model.createBrand(req.body);
            res.status(201).json({
                success: true,
                message: 'Brand created successfully',
                data: newBrand
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                error: err.message
            });
        }
    }

    async updateBrand(req, res, next) {
        try {
            const updatedBrand = await this.model.updateBrand(req.params.id, req.body);
            if (!updatedBrand) {
                return res.status(404).json({
                    success: false,
                    error: `Brand with ID ${req.params.id} not found`
                });
            }
            res.status(200).json({
                success: true,
                message: 'Brand updated successfully',
                data: updatedBrand
            });
        }catch (err) {
            res.status(400).json({
                success: false,
                error: err.message
            });
        }
    }

    async deleteBrand(req, res, next) {
        try {
            const deletedBrand = await this.model.deleteBrand(req.params.id);
            if (!deletedBrand) {
                return res.status(404).json({
                    success: false,
                    error: `Brand with ID ${req.params.id} not found`
                });
            }
            res.status(200).json({
                success: true,
                message: 'Brand deleted successfully',
                data: deletedBrand
            });
        } catch (err) {
            next(err);
        }
    }
}
module.exports = BrandController;