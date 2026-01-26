const RecurringTransaction = require('../models/Recurringtransaction');
const Transaction = require('../models/Transaction');

// @desc    Get all recurring transactions
// @route   GET /api/recurring
// @access  Public
const getRecurringTransactions = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const recurring = await RecurringTransaction.find(query)
      .populate('category', 'name icon color')
      .sort({ nextDueDate: 1 });

    res.json({
      success: true,
      count: recurring.length,
      data: recurring
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring
// @access  Public
const createRecurringTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      account,
      currency,
      frequency,
      dayOfWeek,
      dayOfMonth,
      monthOfYear,
      startDate,
      endDate,
      note
    } = req.body;

    // Calculate initial next due date
    let nextDueDate = new Date(startDate || Date.now());
    
    // Adjust based on frequency
    if (frequency === 'weekly' && dayOfWeek !== undefined) {
      while (nextDueDate.getDay() !== dayOfWeek) {
        nextDueDate.setDate(nextDueDate.getDate() + 1);
      }
    } else if (frequency === 'monthly' && dayOfMonth) {
      nextDueDate.setDate(dayOfMonth);
      if (nextDueDate < new Date()) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
    } else if (frequency === 'yearly' && monthOfYear && dayOfMonth) {
      nextDueDate.setMonth(monthOfYear - 1);
      nextDueDate.setDate(dayOfMonth);
      if (nextDueDate < new Date()) {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      }
    }

    const recurring = await RecurringTransaction.create({
      type,
      amount,
      category,
      description,
      account,
      currency,
      frequency,
      dayOfWeek,
      dayOfMonth,
      monthOfYear,
      startDate,
      endDate,
      nextDueDate,
      note
    });

    const populated = await RecurringTransaction.findById(recurring._id)
      .populate('category', 'name icon color');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring/:id
// @access  Public
const updateRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name icon color');

    if (!recurring) {
      return res.status(404).json({ message: 'ບໍ່ພົບລາຍການ' });
    }

    res.json({
      success: true,
      data: recurring
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Public
const deleteRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findByIdAndDelete(req.params.id);

    if (!recurring) {
      return res.status(404).json({ message: 'ບໍ່ພົບລາຍການ' });
    }

    res.json({
      success: true,
      message: 'ລຶບລາຍການປະຈຳສຳເລັດ'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle active status
// @route   PATCH /api/recurring/:id/toggle
// @access  Public
const toggleRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findById(req.params.id);

    if (!recurring) {
      return res.status(404).json({ message: 'ບໍ່ພົບລາຍການ' });
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.json({
      success: true,
      data: recurring
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process due recurring transactions
// @route   POST /api/recurring/process
// @access  Public (should be protected or run via cron)
const processRecurringTransactions = async (req, res) => {
  try {
    const now = new Date();
    
    // Find all active recurring transactions that are due
    const dueRecurring = await RecurringTransaction.find({
      isActive: true,
      nextDueDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).populate('category');

    const results = {
      processed: 0,
      created: [],
      errors: []
    };

    for (const recurring of dueRecurring) {
      try {
        // Create actual transaction
        const transaction = await Transaction.create({
          type: recurring.type,
          amount: recurring.amount,
          category: recurring.category._id,
          description: recurring.description || `ລາຍການປະຈຳ: ${recurring.category.name}`,
          date: recurring.nextDueDate,
          account: recurring.account,
          currency: recurring.currency,
          note: recurring.note,
          isRecurring: true,
          recurringId: recurring._id
        });

        // Update recurring transaction
        recurring.lastProcessed = recurring.nextDueDate;
        recurring.nextDueDate = recurring.calculateNextDueDate();
        
        // Check if end date passed
        if (recurring.endDate && recurring.nextDueDate > recurring.endDate) {
          recurring.isActive = false;
        }
        
        await recurring.save();

        results.processed++;
        results.created.push({
          recurringId: recurring._id,
          transactionId: transaction._id,
          amount: transaction.amount,
          category: recurring.category.name
        });

      } catch (err) {
        results.errors.push({
          recurringId: recurring._id,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      message: `ປະມວນຜົນ ${results.processed} ລາຍການສຳເລັດ`,
      data: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming recurring transactions
// @route   GET /api/recurring/upcoming
// @access  Public
const getUpcomingRecurring = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcoming = await RecurringTransaction.find({
      isActive: true,
      nextDueDate: { $lte: futureDate }
    })
    .populate('category', 'name icon color')
    .sort({ nextDueDate: 1 });

    res.json({
      success: true,
      count: upcoming.length,
      data: upcoming
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  processRecurringTransactions,
  getUpcomingRecurring
};