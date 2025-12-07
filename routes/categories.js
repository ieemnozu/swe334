const express = require('express');
const authGuard = require('../middleware/authGuard');

const CategoryController = require('../controller/categories');
const Category = require('../models/Category');
const {requireRoles} = require('../middleware/roleGuard');

const router = express.Router();
const category = new CategoryController(new Category());

// Routes for categories
router.route('/')
  .get(category.getCategories.bind(category))
  .post(authGuard, requireRoles(30),category.createCategory.bind(category));

router.route('/:id')
  .get(category.getCategoryById.bind(category))
  .put(authGuard, requireRoles(30), category.updateCategory.bind(category))
  .delete(authGuard, requireRoles(30), category.deleteCategory.bind(category));

module.exports = router;
