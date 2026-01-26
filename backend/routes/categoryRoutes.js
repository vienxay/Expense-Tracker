const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories
} = require('../controllers/categoryController');

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/seed')
  .post(seedCategories);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;