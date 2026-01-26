const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  account: {
    type: String,
    enum: ['cash', 'bank', 'ewallet'],
    default: 'cash'
  },
  currency: {
    type: String,
    enum: ['LAK', 'THB', 'USD'],
    default: 'LAK'
  },
  // Recurring settings
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  dayOfWeek: {
    type: Number, // 0-6 (Sunday-Saturday) for weekly
    min: 0,
    max: 6
  },
  dayOfMonth: {
    type: Number, // 1-31 for monthly
    min: 1,
    max: 31
  },
  monthOfYear: {
    type: Number, // 1-12 for yearly
    min: 1,
    max: 12
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date // Optional end date
  },
  lastProcessed: {
    type: Date
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate next due date
recurringTransactionSchema.methods.calculateNextDueDate = function() {
  const now = new Date();
  let nextDate = new Date(this.nextDueDate);

  while (nextDate <= now) {
    switch (this.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
  }

  return nextDate;
};

// Index for efficient querying
recurringTransactionSchema.index({ isActive: 1, nextDueDate: 1 });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);