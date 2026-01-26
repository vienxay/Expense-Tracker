import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  X, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';
import { transactionAPI, categoryAPI } from '../utils/api';

const QuickAddButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'income' | 'expense'
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Categories ຈາກ database
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ໂຫຼດ categories ເມື່ອເປີດ modal
  useEffect(() => {
    if (isOpen && incomeCategories.length === 0) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryAPI.getAll();
      const categories = response.data || response;
      
      // ແຍກ categories ຕາມປະເພດ
      const income = categories.filter(cat => cat.type === 'income');
      const expense = categories.filter(cat => cat.type === 'expense');
      
      setIncomeCategories(income);
      setExpenseCategories(expense);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('ບໍ່ສາມາດໂຫຼດໝວດໝູ່ໄດ້');
    } finally {
      setLoadingCategories(false);
    }
  };

  const resetForm = () => {
    setStep('select');
    setAmount('');
    setSelectedCategory(null);
    setNote('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) return;

    // ລຶບ comma ອອກເພື່ອແປງເປັນຕົວເລກ
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('ກະລຸນາປ້ອນຈຳນວນເງິນທີ່ຖືກຕ້ອງ');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const transactionData = {
        type: step,
        amount: numericAmount,
        category: selectedCategory._id, // ໃຊ້ _id ຈາກ MongoDB
        description: note || selectedCategory.name,
        date: new Date().toISOString()
      };

      console.log('Sending transaction:', transactionData);

      await transactionAPI.create(transactionData);
      
      setSuccess(true);
      
      // ປິດ modal ຫຼັງຈາກ 1 ວິນາທີ
      setTimeout(() => {
        handleClose();
        // Reload ໜ້າເພື່ອອັບເດດຂໍ້ມູນ
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Error adding transaction:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (value) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const categories = step === 'income' ? incomeCategories : expenseCategories;

  return (
    <>
      {/* Main Add Button in Bottom Nav */}
      <button
        onClick={() => setIsOpen(true)}
        className="btm-nav-item btm-nav-main"
        type="button"
      >
        <div className="btm-nav-main-btn">
          <PlusCircle className="w-7 h-7 text-white" />
        </div>
        <span className="btm-nav-label text-emerald-600">ເພີ່ມ</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[2000] flex items-end justify-center"
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div 
            className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 20px)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {step === 'select' && 'ເພີ່ມທຸລະກຳ'}
                {step === 'income' && '➕ ເພີ່ມລາຍຮັບ'}
                {step === 'expense' && '➖ ເພີ່ມລາຍຈ່າຍ'}
              </h2>
              <button 
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                type="button"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Loading Categories */}
            {loadingCategories && (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">ກຳລັງໂຫຼດ...</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-lg font-bold text-emerald-600">ບັນທຶກສຳເລັດ!</h3>
              </div>
            )}

            {/* Step 1: Select Type */}
            {step === 'select' && !success && !loadingCategories && (
              <div className="p-6 space-y-4">
                <p className="text-center text-slate-500 mb-6">ເລືອກປະເພດທຸລະກຳ</p>
                
                {/* Income Button */}
                <button
                  onClick={() => setStep('income')}
                  type="button"
                  className="w-full flex items-center gap-4 p-5 bg-emerald-50 hover:bg-emerald-100 
                           rounded-2xl transition-all active:scale-[0.98]"
                >
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center
                                shadow-lg shadow-emerald-500/30">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-emerald-700">ລາຍຮັບ</h3>
                    <p className="text-sm text-emerald-600">ເງິນເດືອນ, ໂບນັດ, ຂາຍເຄື່ອງ...</p>
                  </div>
                </button>

                {/* Expense Button */}
                <button
                  onClick={() => setStep('expense')}
                  type="button"
                  className="w-full flex items-center gap-4 p-5 bg-red-50 hover:bg-red-100 
                           rounded-2xl transition-all active:scale-[0.98]"
                >
                  <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center
                                shadow-lg shadow-red-500/30">
                    <TrendingDown className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-red-700">ລາຍຈ່າຍ</h3>
                    <p className="text-sm text-red-600">ອາຫານ, ຄ່ານ້ຳມັນ, ຊື້ເຄື່ອງ...</p>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Enter Details */}
            {(step === 'income' || step === 'expense') && !success && !loadingCategories && (
              <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
                {/* Back Button */}
                <button 
                  onClick={() => {
                    setStep('select');
                    setError('');
                    setSelectedCategory(null);
                  }}
                  type="button"
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  ← ກັບຄືນ
                </button>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    ຈຳນວນເງິນ (₭)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className={`w-full text-3xl font-bold text-center py-4 rounded-2xl border-2 
                              transition-all outline-none
                              ${step === 'income' 
                                ? 'border-emerald-200 focus:border-emerald-500 text-emerald-600' 
                                : 'border-red-200 focus:border-red-500 text-red-600'
                              }`}
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    ໝວດໝູ່
                  </label>
                  
                  {categories.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">
                      <p>ບໍ່ມີໝວດໝູ່</p>
                      <p className="text-sm">ກະລຸນາເພີ່ມໝວດໝູ່ໃນໜ້າຕັ້ງຄ່າກ່ອນ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          onClick={() => setSelectedCategory(cat)}
                          type="button"
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                                    ${selectedCategory?._id === cat._id
                                      ? step === 'income'
                                        ? 'bg-emerald-100 border-2 border-emerald-500'
                                        : 'bg-red-100 border-2 border-red-500'
                                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                                    }`}
                        >
                          <span className="text-2xl">{cat.icon || '📁'}</span>
                          <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    ໝາຍເຫດ (ບໍ່ບັງຄັບ)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 
                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                             outline-none transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!amount || !selectedCategory || isSubmitting}
                  type="button"
                  className={`w-full py-4 rounded-2xl font-bold text-white text-lg
                            transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                            ${step === 'income'
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30'
                              : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                            }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ກຳລັງບັນທຶກ...
                    </span>
                  ) : (
                    `ບັນທຶກ${step === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default QuickAddButton;