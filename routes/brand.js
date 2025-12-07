const express = require('express');
const authGuard = require('../middleware/authGuard');
const {requireRoles} = require('../middleware/roleGuard');
const BrandController = require('../controller/brand');
const Brand = require('../models/Brand');

const router = express.Router();
const brand = new BrandController(new Brand());
router.route('/')
  .get(brand.getBrands.bind(brand))
  .post(authGuard, requireRoles(30), brand.createBrand.bind(brand));

router.route('/:id')
  .get(brand.getBrandById.bind(brand))
  .put(authGuard, requireRoles(30), brand.updateBrand.bind(brand))
  .delete(authGuard, requireRoles(30), brand.deleteBrand.bind(brand));
  
module.exports = router;