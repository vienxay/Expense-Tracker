const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'ກະລຸນາເລືອກປະເພດທຸລະກຳ']
  },
  amount: {
    type: Number,
    required: [true, 'ກະລຸນາໃສ່ຈຳນວນເງິນ'],
    min: [0, 'ຈຳນວນເງິນຕ້ອງຫຼາຍກວ່າ 0']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'ກະລຸນາເລືອກໝວດໝູ່']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'ລາຍລະອຽດຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
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
  tags: [{
    type: String,
    trim: true
  }],
  note: {
    type: String,
    maxlength: [500, 'ໝາຍເຫດຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ']
  }
}, {
  timestamps: true
});

// Index ສຳລັບການຄົ້ນຫາ
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);