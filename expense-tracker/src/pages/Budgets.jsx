import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { formatCurrency, getMonthName } from '../utils/format';
import { budgetAPI } from '../utils/api';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Budgets = () => {
  const { categories, fetchCategories } = useApp();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchCategories();
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const response = await budgetAPI.getAll({
        month: selectedMonth,
        year: selectedYear
      });
      setBudgets(response.data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const handleDeleteClick = (budget) => {
    setDeletingBudget(budget);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;
    
    try {
      await budgetAPI.delete(deletingBudget._id);
      toast.success('ລຶບງົບປະມານສຳເລັດ');
      loadBudgets();
      setShowDeleteModal(false);
      setDeletingBudget(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (percentage >= 80) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="ງົບປະມານ" 
        subtitle="ຕັ້ງ ແລະ ຕິດຕາມງົບປະມານຂອງທ່ານ"
      />
      
      <main className="p-4 md:p-8">
        {/* Month/Year Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field w-auto"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field w-auto"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>ປີ {y}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => {
              setEditingBudget(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            ເພີ່ມງົບປະມານ
          </button>
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-4">ກຳລັງໂຫຼດ...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-slate-500">ຍັງບໍ່ມີງົບປະມານສຳລັບເດືອນນີ້</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              ສ້າງງົບປະມານທຳອິດ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {budgets.map((budget) => (
              <div key={budget._id} className="card p-4 md:p-6 hover:shadow-xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl"
                      style={{ backgroundColor: `${budget.category?.color}20` }}
                    >
                      {budget.category?.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                        {budget.category?.name}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500">
                        {getMonthName(budget.month)} {budget.year}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(budget.percentage)}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">ໃຊ້ໄປ</span>
                    <span className="font-medium text-slate-800">
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getStatusColor(budget.percentage)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="space-y-2 mb-4 text-sm md:text-base">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ງົບປະມານ:</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(budget.amount, budget.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ໃຊ້ໄປ:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(budget.spent, budget.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">ຍັງເຫຼືອ:</span>
                    <span className={`font-semibold ${budget.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(budget.remaining, budget.currency)}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                {budget.percentage >= 80 && budget.percentage < 100 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yellow-700">
                      ⚠️ ໃກ້ຈະເຕັມງົບປະມານແລ້ວ!
                    </p>
                  </div>
                )}
                
                {budget.percentage >= 100 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-red-700">
                      🚨 ເກີນງົບປະມານແລ້ວ!
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBudget(budget);
                      setShowModal(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 
                             active:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    ແກ້ໄຂ
                  </button>
                  <button
                    onClick={() => handleDeleteClick(budget)}
                    className="py-2 px-4 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 
                             active:bg-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Budget Modal */}
        {showModal && (
          <BudgetModal
            budget={editingBudget}
            categories={expenseCategories}
            month={selectedMonth}
            year={selectedYear}
            onClose={() => {
              setShowModal(false);
              setEditingBudget(null);
            }}
            onSave={loadBudgets}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            budget={deletingBudget}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingBudget(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </main>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ budget, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  if (!budget) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full md:w-[400px] rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-500 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🗑️ ລົບງົບປະມານ
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-10 h-10 text-red-500" />
          </div>
          
          {/* Message */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">ຢືນຢັນການລົບ?</h3>
            <p className="text-slate-500">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບງົບປະມານນີ້?
            </p>
          </div>

          {/* Budget Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">{budget.category?.icon}</span>
              <span className="font-semibold text-slate-800">{budget.category?.name}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(budget.amount, budget.currency)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {getMonthName(budget.month)} {budget.year}
            </p>
          </div>

          {/* Warning */}
          <p className="text-sm text-red-500 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold 
                       hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold 
                       hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-50
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
                  ລົບງົບປະມານ
                </>
              )}
            </button>
          </div>
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
      `}</style>
    </div>
  );
};

// Budget Modal Component
const BudgetModal = ({ budget, categories, month, year, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: budget?.category?._id || '',
    amount: budget?.amount || '',
    month: budget?.month || month,
    year: budget?.year || year,
    currency: budget?.currency || 'LAK'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      toast.error('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ');
      return;
    }

    setLoading(true);
    try {
      if (budget) {
        await budgetAPI.update(budget._id, formData);
        toast.success('ອັບເດດງົບປະມານສຳເລັດ');
      } else {
        await budgetAPI.create(formData);
        toast.success('ສ້າງງົບປະມານສຳເລັດ');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full md:w-[450px] max-h-[90vh] rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {budget ? '✏️ ແກ້ໄຂງົບປະມານ' : '➕ ເພີ່ມງົບປະມານ'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ໝວດໝູ່ລາຍຈ່າຍ
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              disabled={!!budget}
            >
              <option value="">ເລືອກໝວດໝູ່</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ງົບປະມານ
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-3 pr-24 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xl font-semibold"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                <option value="LAK">₭ LAK</option>
                <option value="THB">฿ THB</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </div>

          {/* Month/Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ເດືອນ
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                disabled={!!budget}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ປີ
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                disabled={!!budget}
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold 
                       hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl 
                       font-semibold hover:from-blue-600 hover:to-indigo-700 transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ກຳລັງບັນທຶກ...
                </>
              ) : (
                budget ? 'ອັບເດດ' : 'ບັນທຶກ'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Budgets;