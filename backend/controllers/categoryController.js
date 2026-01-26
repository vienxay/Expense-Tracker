const Category = require('../models/Category');

// @desc    ດຶງໝວດໝູ່ທັງໝົດ
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    
    const categories = await Category.find(filter).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ',
      error: error.message
    });
  }
};

// @desc    ສ້າງໝວດໝູ່ໃໝ່
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'ໝວດໝູ່ນີ້ມີຢູ່ແລ້ວ'
      });
    }
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງໝວດໝູ່',
      error: error.message
    });
  }
};

// @desc    ອັບເດດໝວດໝູ່
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບໝວດໝູ່'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ',
      error: error.message
    });
  }
};

// @desc    ລຶບໝວດໝູ່
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'ບໍ່ພົບໝວດໝູ່'
      });
    }
    
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'ບໍ່ສາມາດລຶບໝວດໝູ່ເລີ່ມຕົ້ນໄດ້'
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'ລຶບໝວດໝູ່ສຳເລັດ'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ',
      error: error.message
    });
  }
};

// @desc    ສ້າງໝວດໝູ່ເລີ່ມຕົ້ນ
// @route   POST /api/categories/seed
exports.seedCategories = async (req, res) => {
  try {
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'ໝວດໝູ່ມີຢູ່ແລ້ວ'
      });
    }
    
    const defaultCategories = [
      // ລາຍຮັບ
      { name: 'ເງິນເດືອນ', type: 'income', icon: '💰', color: '#22c55e', isDefault: true },
      { name: 'ທຸລະກິດ', type: 'income', icon: '🏢', color: '#3b82f6', isDefault: true },
      { name: 'ການລົງທຶນ', type: 'income', icon: '📈', color: '#8b5cf6', isDefault: true },
      { name: 'ໂບນັດ', type: 'income', icon: '🎁', color: '#f59e0b', isDefault: true },
      { name: 'ລາຍຮັບອື່ນໆ', type: 'income', icon: '💵', color: '#6366f1', isDefault: true },
      
      // ລາຍຈ່າຍ
      { name: 'ອາຫານ', type: 'expense', icon: '🍜', color: '#ef4444', isDefault: true },
      { name: 'ເດີນທາງ', type: 'expense', icon: '🚗', color: '#f97316', isDefault: true },
      { name: 'ທີ່ຢູ່ອາໄສ', type: 'expense', icon: '🏠', color: '#84cc16', isDefault: true },
      { name: 'ສຸຂະພາບ', type: 'expense', icon: '🏥', color: '#06b6d4', isDefault: true },
      { name: 'ການສຶກສາ', type: 'expense', icon: '📚', color: '#8b5cf6', isDefault: true },
      { name: 'ບັນເທີງ', type: 'expense', icon: '🎬', color: '#ec4899', isDefault: true },
      { name: 'ຊ໊ອບປິ້ງ', type: 'expense', icon: '🛒', color: '#14b8a6', isDefault: true },
      { name: 'ຄ່ານ້ຳ-ໄຟ', type: 'expense', icon: '💡', color: '#eab308', isDefault: true },
      { name: 'ໂທລະສັບ/ອິນເຕີເນັດ', type: 'expense', icon: '📱', color: '#6366f1', isDefault: true },
      { name: 'ລາຍຈ່າຍອື່ນໆ', type: 'expense', icon: '📝', color: '#94a3b8', isDefault: true }
    ];
    
    await Category.insertMany(defaultCategories);
    
    res.status(201).json({
      success: true,
      message: 'ສ້າງໝວດໝູ່ເລີ່ມຕົ້ນສຳເລັດ',
      count: defaultCategories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ເກີດຂໍ້ຜິດພາດ',
      error: error.message
    });
  }
};