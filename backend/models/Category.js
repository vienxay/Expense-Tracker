const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'ກະລຸນາໃສ່ຊື່ໝວດໝູ່'],
    trim: true,
    maxlength: [50, 'ຊື່ໝວດໝູ່ຕ້ອງບໍ່ເກີນ 50 ຕົວອັກສອນ']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'ກະລຸນາເລືອກປະເພດ']
  },
  icon: {
    type: String,
    default: '📁'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);