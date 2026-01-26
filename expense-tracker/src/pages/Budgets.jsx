import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { formatCurrency, getMonthName } from '../utils/format';
import { budgetAPI } from '../utils/api';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Budgets = () => {
  const { categories, fetchCategories } = useApp();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
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

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບງົບປະມານນີ້?')) {
      try {
        await budgetAPI.delete(id);
        toast.success('ລຶບງົບປະມານສຳເລັດ');
        loadBudgets();
      } catch (error) {
        toast.error(error.message);
      }
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
      
      <main className="p-8">
        {/* Month/Year Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
            className="btn-primary flex items-center gap-2"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <div key={budget._id} className="card p-6 hover:shadow-xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${budget.category?.color}20` }}
                    >
                      {budget.category?.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {budget.category?.name}
                      </h3>
                      <p className="text-sm text-slate-500">
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
                <div className="space-y-2 mb-4">
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
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    ແກ້ໄຂ
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="py-2 px-4 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
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
      </main>
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white">
              {budget ? 'ແກ້ໄຂງົບປະມານ' : 'ເພີ່ມງົບປະມານ'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ໝວດໝູ່ລາຍຈ່າຍ
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
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
                  className="input-field pr-20 text-xl font-semibold"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 px-3 py-1 rounded-lg text-sm"
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
                  className="input-field"
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
                  className="input-field"
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
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                ຍົກເລີກ
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'ກຳລັງບັນທຶກ...' : budget ? 'ອັບເດດ' : 'ບັນທຶກ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Budgets;