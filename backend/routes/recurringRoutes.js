const express = require('express');
const router = express.Router();
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  processRecurringTransactions,
  getUpcomingRecurring
} = require('../controllers/recurringController');

// Main CRUD routes
router.route('/')
  .get(getRecurringTransactions)
  .post(createRecurringTransaction);

router.route('/:id')
  .put(updateRecurringTransaction)
  .delete(deleteRecurringTransaction);

// Special routes
router.patch('/:id/toggle', toggleRecurringTransaction);
router.post('/process', processRecurringTransactions);
router.get('/upcoming', getUpcomingRecurring);

module.exports = router;