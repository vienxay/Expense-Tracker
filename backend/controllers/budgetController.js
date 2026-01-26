const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    ດຶງງົບປະມານທັງໝົດ
// @route   GET /api/budgets
exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    
    const budgets = await Budget.find(filter)
      .populate('category', 'name icon color type');
    
    // ຄຳນວນການໃຊ້ຈ່າຍຈິງ
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);
        
        const spent = await Transaction.aggregate([
          {
            $match: {
              category: budget.category._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate },
              currency: budget.currency
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        
        return {
          ...budget.toObject(),
          spent: spent[0]?.total || 0,
          remaining: budget.amount - (spent[0]?.total || 0),
          percentage: ((spent[0]?.total || 0) / budget.amount) * 100
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: budgetsWithSpent.length,
      data: budgetsWithSpent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};

// @desc    ສ້າງງົບປະມານໃໝ່
// @route   POST /api/budgets
exports.createBudget = async (req, res) => {
  try {
    const budget = await Budget.create(req.body);
    
    const populatedBudget = await Budget.findById(budget._id)
      .populate('category', 'name icon color type');
    
    res.status(201).json({
      success: true,
      data: populatedBudget
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'ງົບປະມານສຳລັບໝວດໝູ່ນີ້ໃນເດືອນນີ້ມີຢູ່ແລ້ວ'
      });
    }
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};

// @desc    ອັບເດດງົບປະມານ
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name icon color type');
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບງົບປະມານ'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};

// @desc    ລຶບງົບປະມານ
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບງົບປະມານ'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'ລຶບງົບປະມານສຳເລັດ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};