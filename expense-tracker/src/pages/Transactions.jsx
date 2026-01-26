import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import { Filter, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const Transactions = () => {
  const { 
    transactions, 
    categories,
    pagination,
    fetchTransactions, 
    fetchCategories,
    loading 
  } = useApp();
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    search: ''
  });
  
  // const [showFilters, setShowFilters] = useState(false);

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

  const filteredCategories = filters.type 
    ? categories.filter(cat => cat.type === filters.type)
    : categories;

  return (
    <div className="min-h-screen">
      <Header 
        title="ທຸລະກຳທັງໝົດ" 
        subtitle="ເບິ່ງ ແລະ ຈັດການທຸລະກຳຂອງທ່ານ"
      />
      
      <main className="p-8">
        {/* Filter Bar */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
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

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field w-auto"
            >
              <option value="">ທຸກປະເພດ</option>
              <option value="income">ລາຍຮັບ</option>
              <option value="expense">ລາຍຈ່າຍ</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field w-auto"
            >
              <option value="">ທຸກໝວດໝູ່</option>
              {filteredCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            {/* Date Range */}
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

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({
                type: '',
                category: '',
                startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                search: ''
              })}
              className="btn-secondary"
            >
              ລ້າງຕົວກອງ
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="card p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-500 mt-4">ກຳລັງໂຫຼດ...</p>
            </div>
          ) : (
            <>
              <TransactionList transactions={transactions} />
              
              {/* Pagination */}
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
    </div>
  );
};

export default Transactions;