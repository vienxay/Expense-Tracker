import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { categoryAPI } from '../utils/api';
import { Plus, Edit2, Trash2, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { categories, fetchCategories, seedCategories } = useApp();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteCategory = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່ນີ້?')) {
      try {
        await categoryAPI.delete(id);
        toast.success('ລຶບໝວດໝູ່ສຳເລັດ');
        fetchCategories();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="min-h-screen">
      <Header 
        title="ຕັ້ງຄ່າ" 
        subtitle="ຈັດການໝວດໝູ່ ແລະ ການຕັ້ງຄ່າລະບົບ"
      />
      
      <main className="p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            ໝວດໝູ່
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'data'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            ຂໍ້ມູນ
          </button>
        </div>

        {activeTab === 'categories' && (
          <>
            {/* Add Category Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">ຈັດການໝວດໝູ່</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                ເພີ່ມໝວດໝູ່
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Categories */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                  💰 ໝວດໝູ່ລາຍຮັບ
                  <span className="text-sm font-normal text-slate-500">
                    ({incomeCategories.length} ລາຍການ)
                  </span>
                </h3>
                <div className="space-y-3">
                  {incomeCategories.map((cat) => (
                    <div 
                      key={cat._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{cat.name}</p>
                          {cat.isDefault && (
                            <span className="text-xs text-slate-400">ໝວດໝູ່ເລີ່ມຕົ້ນ</span>
                          )}
                        </div>
                      </div>
                      {!cat.isDefault && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setShowCategoryModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                  💸 ໝວດໝູ່ລາຍຈ່າຍ
                  <span className="text-sm font-normal text-slate-500">
                    ({expenseCategories.length} ລາຍການ)
                  </span>
                </h3>
                <div className="space-y-3">
                  {expenseCategories.map((cat) => (
                    <div 
                      key={cat._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{cat.name}</p>
                          {cat.isDefault && (
                            <span className="text-xs text-slate-400">ໝວດໝູ່ເລີ່ມຕົ້ນ</span>
                          )}
                        </div>
                      </div>
                      {!cat.isDefault && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setShowCategoryModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'data' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">ຈັດການຂໍ້ມູນ</h3>
            
            <div className="space-y-4">
              {/* Seed Categories */}
              <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Database className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">ສ້າງໝວດໝູ່ເລີ່ມຕົ້ນ</p>
                    <p className="text-sm text-slate-500">ສ້າງໝວດໝູ່ມາດຕະຖານສຳລັບລາຍຮັບ ແລະ ລາຍຈ່າຍ</p>
                  </div>
                </div>
                <button
                  onClick={seedCategories}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  ສ້າງໝວດໝູ່
                </button>
              </div>

              {/* Export Data */}
              <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">ສົ່ງອອກຂໍ້ມູນ</p>
                    <p className="text-sm text-slate-500">ດາວໂຫຼດຂໍ້ມູນທຸລະກຳທັງໝົດ (ຍັງບໍ່ພ້ອມໃຊ້)</p>
                  </div>
                </div>
                <button
                  disabled
                  className="btn-secondary opacity-50 cursor-not-allowed"
                >
                  ສົ່ງອອກ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <CategoryModal
            category={editingCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
            onSave={() => {
              fetchCategories();
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'expense',
    icon: category?.icon || '📁',
    color: category?.color || '#6366f1'
  });
  const [loading, setLoading] = useState(false);

  const icons = ['💰', '💵', '💳', '🏦', '📈', '🎁', '💼', '🏢', '🍜', '🚗', '🏠', '🏥', '📚', '🎬', '🛒', '💡', '📱', '📝', '✈️', '🎮', '👕', '💄', '🐕', '🏋️'];
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('ກະລຸນາໃສ່ຊື່ໝວດໝູ່');
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await categoryAPI.update(category._id, formData);
        toast.success('ອັບເດດໝວດໝູ່ສຳເລັດ');
      } else {
        await categoryAPI.create(formData);
        toast.success('ສ້າງໝວດໝູ່ສຳເລັດ');
      }
      onSave();
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
          <div className="px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white">
              {category ? 'ແກ້ໄຂໝວດໝູ່' : 'ເພີ່ມໝວດໝູ່ໃໝ່'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ປະເພດ
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ລາຍຮັບ
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ລາຍຈ່າຍ
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ຊື່ໝວດໝູ່
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ປ້ອນຊື່ໝວດໝູ່"
                className="input-field"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ໄອຄອນ
              </label>
              <div className="grid grid-cols-8 gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-2 text-xl rounded-lg transition-all ${
                      formData.icon === icon
                        ? 'bg-violet-100 ring-2 ring-violet-500'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ສີ
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-500 mb-2">ຕົວຢ່າງ:</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  {formData.icon}
                </div>
                <span className="font-medium text-slate-700">
                  {formData.name || 'ຊື່ໝວດໝູ່'}
                </span>
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
                {loading ? 'ກຳລັງບັນທຶກ...' : category ? 'ອັບເດດ' : 'ບັນທຶກ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;