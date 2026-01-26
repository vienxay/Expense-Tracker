const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'ກະລຸນາໃສ່ຈຳນວນງົບປະມານ'],
    min: [0, 'ງົບປະມານຕ້ອງຫຼາຍກວ່າ 0']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['LAK', 'THB', 'USD'],
    default: 'LAK'
  }
}, {
  timestamps: true
});

// ປ້ອງກັນການສ້າງງົບປະມານຊ້ຳ
budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);