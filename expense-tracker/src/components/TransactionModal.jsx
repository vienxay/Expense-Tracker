import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, Wallet, Building2, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const TransactionModal = ({ type: initialType, transaction, onClose }) => {
  const { categories, fetchCategories, createTransaction, updateTransaction } = useApp();
  const isEditing = !!transaction;
  
  const [formData, setFormData] = useState({
    type: initialType || 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    account: 'cash',
    currency: 'LAK',
    note: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories(formData.type);
  }, [formData.type, fetchCategories]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category._id,
        description: transaction.description || '',
        date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        account: transaction.account,
        currency: transaction.currency,
        note: transaction.note || ''
      });
    }
  }, [transaction]);

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'ກະລຸນາໃສ່ຈຳນວນເງິນ';
    }
    if (!formData.category) {
      newErrors.category = 'ກະລຸນາເລືອກໝວດໝູ່';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (isEditing) {
        await updateTransaction(transaction._id, data);
      } else {
        await createTransaction(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = [
    { value: 'cash', label: 'ເງິນສົດ', icon: Wallet },
    { value: 'bank', label: 'ທະນາຄານ', icon: Building2 },
    { value: 'ewallet', label: 'E-Wallet', icon: Smartphone }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className={`px-6 py-4 rounded-t-2xl ${
            formData.type === 'income' 
              ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? 'ແກ້ໄຂທຸລະກຳ' : formData.type === 'income' ? 'ເພີ່ມລາຍຮັບ' : 'ເພີ່ມລາຍຈ່າຍ'}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type Toggle */}
            {!isEditing && (
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  ລາຍຮັບ
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  ລາຍຈ່າຍ
                </button>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ຈຳນວນເງິນ
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0"
                  className={`input-field pl-10 pr-20 text-xl font-semibold ${
                    errors.amount ? 'border-red-500' : ''
                  }`}
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  <option value="LAK">₭ LAK</option>
                  <option value="THB">฿ THB</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ໝວດໝູ່
              </label>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat._id }))}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      formData.category === cat._id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{cat.icon}</span>
                    <span className="text-xs text-slate-600 line-clamp-1">{cat.name}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ວັນທີ
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ບັນຊີ
              </label>
              <div className="flex gap-2">
                {accountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, account: opt.value }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      formData.account === opt.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ລາຍລະອຽດ
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="ປ້ອນລາຍລະອຽດ (ຖ້າມີ)"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ໝາຍເຫດ
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                } text-white shadow-lg disabled:opacity-50`}
              >
                {loading ? 'ກຳລັງບັນທຶກ...' : isEditing ? 'ອັບເດດ' : 'ບັນທຶກ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;