import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Save, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';
import { transactionAPI, categoryAPI } from '../utils/api';

const TransactionModal = ({ isOpen, onClose, transaction, onSuccess, initialMode = 'view' }) => {
  const [mode, setMode] = useState(initialMode); // 'view' | 'edit' | 'delete'
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    category: '',
    description: '',
    date: '',
    note: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ໂຫຼດຂໍ້ມູນເມື່ອເປີດ modal
  useEffect(() => {
    if (isOpen && transaction) {
      setFormData({
        type: transaction.type || '',
        amount: transaction.amount?.toLocaleString() || '',
        category: transaction.category?._id || transaction.category || '',
        description: transaction.description || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        note: transaction.note || ''
      });
      setMode(initialMode);
      setError('');
      loadCategories(transaction.type);
    }
  }, [isOpen, transaction, initialMode]);

  const loadCategories = async (type) => {
    try {
      const response = await categoryAPI.getAll(type);
      const data = Array.isArray(response) ? response : (response.data || []);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ ...prev, type: newType, category: '' }));
    loadCategories(newType);
  };

  const formatNumber = (value) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e) => {
    setFormData(prev => ({ ...prev, amount: formatNumber(e.target.value) }));
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(formData.amount.replace(/,/g, ''));
    
    if (!numericAmount || numericAmount <= 0) {
      setError('ກະລຸນາປ້ອນຈຳນວນເງິນທີ່ຖືກຕ້ອງ');
      return;
    }
    if (!formData.category) {
      setError('ກະລຸນາເລືອກໝວດໝູ່');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await transactionAPI.update(transaction._id, {
        type: formData.type,
        amount: numericAmount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        note: formData.note
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await transactionAPI.delete(transaction._id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບ');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  };

  if (!isOpen || !transaction) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full md:w-[480px] max-h-[90vh] rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${
          mode === 'delete' 
            ? 'bg-red-500' 
            : formData.type === 'income' 
              ? 'bg-emerald-500' 
              : 'bg-red-500'
        }`}>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {mode === 'view' && '📋 ລາຍລະອຽດທຸລະກຳ'}
            {mode === 'edit' && '✏️ ແກ້ໄຂທຸລະກຳ'}
            {mode === 'delete' && '🗑️ ລົບທຸລະກຳ'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[70vh]" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* View Mode */}
          {mode === 'view' && (
            <div className="space-y-4">
              {/* Amount Display */}
              <div className={`text-center py-6 rounded-2xl ${
                transaction.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
              }`}>
                <p className="text-sm text-slate-500 mb-1">
                  {transaction.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'}
                </p>
                <p className={`text-3xl font-bold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">
                    {transaction.category?.icon || '📁'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ໝວດໝູ່</p>
                    <p className="font-medium text-slate-800">{transaction.category?.name || 'ບໍ່ລະບຸ'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ວັນທີ</p>
                    <p className="font-medium text-slate-800">
                      {new Date(transaction.date).toLocaleDateString('lo-LA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {transaction.description && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ລາຍລະອຽດ</p>
                      <p className="font-medium text-slate-800">{transaction.description}</p>
                    </div>
                  </div>
                )}

                {transaction.note && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ໝາຍເຫດ</p>
                      <p className="font-medium text-slate-800">{transaction.note}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMode('edit')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold 
                           hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  ແກ້ໄຂ
                </button>
                <button
                  onClick={() => setMode('delete')}
                  className="py-3 px-5 bg-red-100 text-red-600 rounded-xl font-semibold 
                           hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {mode === 'edit' && (
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ປະເພດ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                      formData.type === 'income'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">ລາຍຮັບ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-medium">ລາຍຈ່າຍ</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ຈຳນວນເງິນ (₭)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={`w-full text-2xl font-bold text-center py-3 rounded-xl border-2 outline-none transition-all ${
                    formData.type === 'income'
                      ? 'border-emerald-200 focus:border-emerald-500 text-emerald-600'
                      : 'border-red-200 focus:border-red-500 text-red-600'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ໝວດໝູ່</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat._id }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        formData.category === cat._id
                          ? formData.type === 'income'
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : 'bg-red-100 border-2 border-red-500'
                          : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xl">{cat.icon || '📁'}</span>
                      <span className="text-xs font-medium text-slate-700 text-center leading-tight line-clamp-1">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ວັນທີ</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ລາຍລະອຽດ</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ລາຍລະອຽດທຸລະກຳ..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ໝາຍເຫດ</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMode('view')}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold 
                           hover:bg-emerald-600 transition-colors disabled:opacity-50 
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ກຳລັງບັນທຶກ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      ບັນທຶກ
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {mode === 'delete' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">ຢືນຢັນການລົບ?</h3>
                <p className="text-slate-500">
                  ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບທຸລະກຳນີ້?
                </p>
              </div>

              {/* Transaction Summary */}
              <div className={`p-4 rounded-xl ${
                transaction.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
              }`}>
                <p className={`text-2xl font-bold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {transaction.category?.icon} {transaction.category?.name}
                </p>
              </div>

              <p className="text-sm text-red-500 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMode('view')}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold 
                           hover:bg-red-600 transition-colors disabled:opacity-50
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ກຳລັງລົບ...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      ລົບທຸລະກຳ
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TransactionModal;