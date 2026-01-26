import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TransactionList from '../components/TransactionList';
import CategoryChart from '../components/CategoryChart';
import { transactionAPI } from '../utils/api';
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
  
  const [categoryData, setCategoryData] = useState({ income: [], expense: [] });
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
      {/* Header */}
      <Header 
        title="ໜ້າຫຼັກ" 
        subtitle="ສະຫຼຸບການເງິນຂອງທ່ານ"
      />
      
      {/* Stats Grid - Responsive */}
      <div className="stats-grid">
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

      {/* Date Filter Pills */}
      <div className="filter-pills">
        {dateRangeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDateRange(opt.value)}
            className={`filter-pill ${dateRange === opt.value ? 'active' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category Charts - Responsive Grid */}
      <div className="charts-grid mt-4">
        {/* Expense by Category */}
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">
            📊 ລາຍຈ່າຍຕາມໝວດໝູ່
          </h3>
          <CategoryChart data={categoryData.expense} />
        </div>

        {/* Income by Category */}
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">
            📈 ລາຍຮັບຕາມໝວດໝູ່
          </h3>
          <CategoryChart data={categoryData.income} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="section-title mt-4 md:mt-8">
        <h2>📝 ທຸລະກຳລ່າສຸດ</h2>
        <a href="/transactions">ເບິ່ງທັງໝົດ →</a>
      </div>
      
      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <div className="transaction-list">
          <TransactionList transactions={transactions} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;