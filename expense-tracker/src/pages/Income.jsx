import React, { useEffect, useState } from 'react';
import { useApp } from '../utils/appHooks';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { Calendar, ChevronLeft, ChevronRight, Search, Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const Income = () => {
  const { 
    transactions, 
    categories,
    pagination,
    fetchTransactions, 
    fetchCategories,
    createTransaction,
    loading 
  } = useApp();
  
  const [filters, setFilters] = useState({
    type: 'income',
    category: '',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    search: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'income'
  });

  // ✅ State ສຳລັບ Toast Notification
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    icon: null
  });

  // ✅ ฟังก์ชันแสดง Toast
  const showToast = (message, type = 'success') => {
    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      error: <XCircle className="w-5 h-5 text-red-500" />,
      info: <X className="w-5 h-5 text-blue-500" />
    };

    setToast({
      show: true,
      message,
      type,
      icon: icons[type]
    });

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // ✅ จัดการยกเลิกพร้อมแสดง Toast
  const handleCancel = () => {
    setShowModal(false);
    showToast('ຍົກເລີກການເພີ່ມລາຍຮັບ', 'info');
  };

  // ✅ จัดการบันทึกพร้อมแสดง Toast
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      showToast('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
      return;
    }

    try {
      await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      showToast('ບັນທຶກລາຍຮັບສຳເລັດ!', 'success');
      
      setShowModal(false);
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'income'
      });
      
      fetchTransactions({ ...filters, page: 1, limit: 20 });
    } catch (error) {
      showToast('ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງອີກຄັ້ງ', 'error');
      console.error('Error creating income:', error);
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const params = {
      ...filters,
      page: 1,
      limit: 20
    };
    fetchTransactions(params);
  }, [filters, fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage) => {
    fetchTransactions({
      ...filters,
      page: newPage,
      limit: 20
    });
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="min-h-screen relative">
      <Header 
        title="ລາຍຮັບ" 
        subtitle="ເບິ່ງ ແລະ ຈັດການລາຍຮັບຂອງທ່ານ"
      />
      
      <main className="p-8">
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາ..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field w-auto"
            >
              <option value="">ທຸກໝວດໝູ່</option>
              {incomeCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input-field pl-10 w-40"
                />
              </div>
              <span className="text-slate-400">ຫາ</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input-field w-40"
              />
            </div>

            <button
              onClick={() => setFilters({
                type: 'income',
                category: '',
                startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                search: ''
              })}
              className="btn-secondary"
            >
              ລ້າງຕົວກອງ
            </button>

            <div className="w-px h-8 bg-slate-300 mx-2"></div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              ເພີ່ມລາຍຮັບ
            </button>
          </div>
        </div>

        <div className="card p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-500 mt-4">ກຳລັງໂຫຼດ...</p>
            </div>
          ) : (
            <>
              <TransactionList transactions={transactions} />
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    ສະແດງ {(pagination.page - 1) * 20 + 1} - {Math.min(pagination.page * 20, pagination.total)} ຈາກ {pagination.total} ລາຍການ
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            pagination.page === page
                              ? 'bg-emerald-500 text-white'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            onClick={() => setShowModal(false)}
          />
          
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">ເພີ່ມລາຍຮັບ</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ຈຳນວນເງິນ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      autoFocus
                      value={formData.amount}
                      onChange={(e) => handleFormChange('amount', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg font-semibold"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      ກີບ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ໝວດໝູ່ <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">ເລືອກໝວດໝູ່</option>
                    {incomeCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ວັນທີ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ລາຍລະອຽດ
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="ເພີ່ມລາຍລະອຽດ..."
                  />
                </div>

                {/* ✅ Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30"
                  >
                    ບັນທຶກ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ✅ Toast Notification */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toast.show && (
          <div 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transform transition-all duration-300 animate-in slide-in-from-right fade-in ${
              toast.type === 'success' ? 'bg-white border-green-200' :
              toast.type === 'error' ? 'bg-white border-red-200' :
              'bg-white border-blue-200'
            }`}
          >
            {toast.icon}
            <span className={`font-medium ${
              toast.type === 'success' ? 'text-green-700' :
              toast.type === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {toast.message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Income;