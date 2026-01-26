const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getByCategory,
  getTrend
} = require('../controllers/transactionController');

router.route('/summary')
  .get(getSummary);

router.route('/by-category')
  .get(getByCategory);

router.route('/trend')
  .get(getTrend);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;