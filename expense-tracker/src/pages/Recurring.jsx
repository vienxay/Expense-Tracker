import { useState, useEffect } from 'react';
import { useApp } from '../utils/appHooks';
import Header from '../components/Header';
import { formatCurrency, formatDateLao } from '../utils/format';
import { 
  Plus, Edit2, Trash2, Play, Pause, Calendar, 
  RefreshCw, ArrowUpCircle, ArrowDownCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Recurring = () => {
  const { categories, fetchCategories } = useApp();
  const [recurring, setRecurring] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchCategories();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recurringRes, upcomingRes] = await Promise.all([
        api.get('/recurring'),
        api.get('/recurring/upcoming?days=7')
      ]);
      setRecurring(recurringRes.data || []);
      setUpcoming(upcomingRes.data || []);
    } catch (error) {
      console.error('Error loading recurring:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/recurring/${id}/toggle`);
      toast.success('ປ່ຽນສະຖານະສຳເລັດ');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?')) {
      try {
        await api.delete(`/recurring/${id}`);
        toast.success('ລຶບລາຍການສຳເລັດ');
        loadData();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleProcess = async () => {
    try {
      const result = await api.post('/recurring/process');
      toast.success(result.message || 'ປະມວນຜົນສຳເລັດ');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getFrequencyLabel = (freq) => {
    const labels = {
      daily: 'ທຸກວັນ',
      weekly: 'ທຸກອາທິດ',
      monthly: 'ທຸກເດືອນ',
      yearly: 'ທຸກປີ'
    };
    return labels[freq] || freq;
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="ລາຍການປະຈຳ" 
        subtitle="ຈັດການລາຍຮັບ-ລາຍຈ່າຍອັດຕະໂນມັດ"
      />
      
      <main className="p-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleProcess}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              ປະມວນຜົນລາຍການຄ້າງ
            </button>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ເພີ່ມລາຍການປະຈຳ
          </button>
        </div>

        {/* Upcoming Section */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              ລາຍການທີ່ຈະມາຮອດ (7 ວັນຂ້າງໜ້າ)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((item) => (
                <div key={item._id} className="card p-4 border-l-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${item.category?.color}20` }}
                    >
                      {item.category?.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{item.category?.name}</p>
                      <p className="text-sm text-slate-500">{formatDateLao(item.nextDueDate)}</p>
                    </div>
                    <p className={`font-semibold ${item.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main List */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-4">ກຳລັງໂຫຼດ...</p>
          </div>
        ) : recurring.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">ຍັງບໍ່ມີລາຍການປະຈຳ</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4"
            >
              ສ້າງລາຍການທຳອິດ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recurring.map((item) => (
              <div 
                key={item._id} 
                className={`card p-6 transition-all duration-300 ${
                  item.isActive ? 'hover:shadow-xl' : 'opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${item.category?.color}20` }}
                    >
                      {item.category?.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.category?.name}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        {item.type === 'income' ? (
                          <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span>{getFrequencyLabel(item.frequency)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isActive 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.isActive ? 'ເປີດໃຊ້' : 'ປິດ'}
                  </span>
                </div>

                {/* Amount */}
                <p className={`text-2xl font-bold mb-4 ${
                  item.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrency(item.amount, item.currency)}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ຄັ້ງຕໍ່ໄປ:</span>
                    <span className="text-slate-700">{formatDateLao(item.nextDueDate)}</span>
                  </div>
                  {item.lastProcessed && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">ຄັ້ງລ່າສຸດ:</span>
                      <span className="text-slate-700">{formatDateLao(item.lastProcessed)}</span>
                    </div>
                  )}
                  {item.description && (
                    <p className="text-slate-500 italic">"{item.description}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleToggle(item._id)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                      item.isActive 
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                    }`}
                  >
                    {item.isActive ? (
                      <>
                        <Pause className="w-4 h-4" />
                        ຢຸດ
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        ເປີດ
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowModal(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <RecurringModal
            item={editingItem}
            categories={categories}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            onSave={loadData}
          />
        )}
      </main>
    </div>
  );
};

// Modal Component
const RecurringModal = ({ item, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: item?.type || 'expense',
    amount: item?.amount || '',
    category: item?.category?._id || '',
    description: item?.description || '',
    account: item?.account || 'cash',
    currency: item?.currency || 'LAK',
    frequency: item?.frequency || 'monthly',
    dayOfMonth: item?.dayOfMonth || 1,
    dayOfWeek: item?.dayOfWeek || 0,
    startDate: item?.startDate ? item.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    note: item?.note || ''
  });
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      toast.error('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ');
      return;
    }

    setLoading(true);
    try {
      if (item) {
        await api.put(`/recurring/${item._id}`, formData);
        toast.success('ອັບເດດລາຍການສຳເລັດ');
      } else {
        await api.post('/recurring', formData);
        toast.success('ສ້າງລາຍການສຳເລັດ');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className={`px-6 py-4 rounded-t-2xl sticky top-0 ${
            formData.type === 'income'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}>
            <h2 className="text-xl font-semibold text-white">
              {item ? 'ແກ້ໄຂລາຍການປະຈຳ' : 'ເພີ່ມລາຍການປະຈຳ'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-slate-600'
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
                    : 'text-slate-600'
                }`}
              >
                ລາຍຈ່າຍ
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ຈຳນວນເງິນ</label>
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ໝວດໝູ່</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                <option value="">ເລືອກໝວດໝູ່</option>
                {filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ຄວາມຖີ່</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="input-field"
              >
                <option value="daily">ທຸກວັນ</option>
                <option value="weekly">ທຸກອາທິດ</option>
                <option value="monthly">ທຸກເດືອນ</option>
                <option value="yearly">ທຸກປີ</option>
              </select>
            </div>

            {/* Day selection based on frequency */}
            {formData.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ວັນໃນອາທິດ</label>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, dayOfWeek: index }))}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${
                        formData.dayOfWeek === index
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ວັນທີໃນເດືອນ</label>
                <select
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>ວັນທີ {i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ບັນຊີ</label>
              <select
                value={formData.account}
                onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                className="input-field"
              >
                <option value="cash">ເງິນສົດ</option>
                <option value="bank">ທະນາຄານ</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ລາຍລະອຽດ</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="ເຊັ່ນ: ຄ່າເຊົ່າເຮືອນ, ເງິນເດືອນ..."
                className="input-field"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                ຍົກເລີກ
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'ກຳລັງບັນທຶກ...' : item ? 'ອັບເດດ' : 'ບັນທຶກ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Recurring;