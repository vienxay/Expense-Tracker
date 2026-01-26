import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TransactionList from '../components/TransactionList';
import CategoryChart from '../components/CategoryChart';
import { transactionAPI } from '../utils/api';
import { Calendar, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const Dashboard = () => {
  const { 
    transactions, 
    summary, 
    fetchTransactions, 
    fetchSummary, 
    fetchCategories,
    loading 
  } = useApp();
  
  const [categoryData, setCategoryData] = useState([]);
  const [dateRange, setDateRange] = useState('month');
  
  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      let startDate, endDate;
      
      switch (dateRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          endDate = new Date();
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        case 'year':
          startDate = new Date(new Date().getFullYear(), 0, 1);
          endDate = new Date();
          break;
        default:
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
      }
      
      const params = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        limit: 10
      };
      
      fetchTransactions(params);
      fetchSummary(params);
      fetchCategories();
      
      // Fetch category breakdown
      try {
        const [incomeData, expenseData] = await Promise.all([
          transactionAPI.getByCategory({ ...params, type: 'income' }),
          transactionAPI.getByCategory({ ...params, type: 'expense' })
        ]);
        setCategoryData({
          income: incomeData.data,
          expense: expenseData.data
        });
      } catch (error) {
        console.error('Error loading category data:', error);
      }
    };
    
    loadData();
  }, [dateRange, fetchTransactions, fetchSummary, fetchCategories]);

  const dateRangeOptions = [
    { value: 'week', label: '7 ວັນ' },
    { value: 'month', label: 'ເດືອນນີ້' },
    { value: 'year', label: 'ປີນີ້' }
  ];

  return (
    <div className="min-h-screen">
      <Header 
        title="ໜ້າຫຼັກ" 
        subtitle={`ສະຫຼຸບການເງິນຂອງທ່ານ`}
      />
      
      <main className="p-8">
        {/* Date Range Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">ສະແດງຂໍ້ມູນ:</span>
          </div>
          <div className="flex gap-2">
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  dateRange === opt.value
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            type="income" 
            amount={summary.income} 
            count={summary.incomeCount}
          />
          <StatCard 
            type="expense" 
            amount={summary.expense} 
            count={summary.expenseCount}
          />
          <StatCard 
            type="balance" 
            amount={summary.balance}
          />
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense by Category */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📊 ລາຍຈ່າຍຕາມໝວດໝູ່
            </h3>
            <CategoryChart data={categoryData.expense} />
          </div>

          {/* Income by Category */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📈 ລາຍຮັບຕາມໝວດໝູ່
            </h3>
            <CategoryChart data={categoryData.income} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              📝 ທຸລະກຳລ່າສຸດ
            </h3>
            <a 
              href="/transactions" 
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ເບິ່ງທັງໝົດ →
            </a>
          </div>
          
          {loading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-500 mt-4">ກຳລັງໂຫຼດ...</p>
            </div>
          ) : (
            <div className="card p-6">
              <TransactionList transactions={transactions} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;