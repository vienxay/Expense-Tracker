const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    ດຶງທຸລະກຳທັງໝົດ
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      account,
      currency,
      page = 1,
      limit = 20,
      sort = '-date'
    } = req.query;
    
    // ສ້າງ filter
    const filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (account) filter.account = account;
    if (currency) filter.currency = currency;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('category', 'name icon color type')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ',
      error: error.message
    });
  }
};

// @desc    ດຶງທຸລະກຳດຽວ
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('category', 'name icon color type');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບທຸລະກຳ'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};

// @desc    ສ້າງທຸລະກຳໃໝ່
// @route   POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('category', 'name icon color type');
    
    res.status(201).json({
      success: true,
      data: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງທຸລະກຳ',
      error: error.message
    });
  }
};

// @desc    ອັບເດດທຸລະກຳ
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name icon color type');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບທຸລະກຳ'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ',
      error: error.message
    });
  }
};

// @desc    ລຶບທຸລະກຳ
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບທຸລະກຳ'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'ລຶບທຸລະກຳສຳເລັດ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ',
      error: error.message
    });
  }
};

// @desc    ສະຫຼຸບຍອດ
// @route   GET /api/transactions/summary
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate, currency = 'LAK' } = req.query;
    
    const matchStage = { currency };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    };
    
    summary.forEach(item => {
      if (item._id === 'income') {
        result.income = item.total;
        result.incomeCount = item.count;
      } else {
        result.expense = item.total;
        result.expenseCount = item.count;
      }
    });
    
    result.balance = result.income - result.expense;
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};

// @desc    ສະຫຼຸບຕາມໝວດໝູ່
// @route   GET /api/transactions/by-category
exports.getByCategory = async (req, res) => {
  try {
    const { type, startDate, endDate, currency = 'LAK' } = req.query;
    
    const matchStage = { currency };
    if (type) matchStage.type = type;
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          name: '$category.name',
          icon: '$category.icon',
          color: '$category.color',
          type: '$category.type'
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};

// @desc    ສະຫຼຸບຕາມເວລາ (ວັນ/ອາທິດ/ເດືອນ)
// @route   GET /api/transactions/trend
exports.getTrend = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate, currency = 'LAK' } = req.query;
    
    const matchStage = { currency };
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }
    
    let groupId;
    switch (period) {
      case 'monthly':
        groupId = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
        break;
      case 'weekly':
        groupId = {
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      default: // daily
        groupId = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
    }
    
    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            period: groupId,
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.period.year': 1, '_id.period.month': 1, '_id.period.day': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};