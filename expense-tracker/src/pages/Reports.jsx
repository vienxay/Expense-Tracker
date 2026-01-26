import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import CategoryChart from '../components/CategoryChart';
import { transactionAPI } from '../utils/api';
import { formatCurrency, getMonthName } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [period ] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [categoryData, setCategoryData] = useState({ income: [], expense: [] });
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    loadReportData();
  }, [period, year]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      // Fetch all data
      const [incomeByCategory, expenseByCategory, summaryData, trendDataRes] = await Promise.all([
        transactionAPI.getByCategory({ type: 'income', startDate, endDate }),
        transactionAPI.getByCategory({ type: 'expense', startDate, endDate }),
        transactionAPI.getSummary({ startDate, endDate }),
        transactionAPI.getTrend({ period: 'monthly', startDate, endDate })
      ]);

      setCategoryData({
        income: incomeByCategory.data,
        expense: expenseByCategory.data
      });
      
      setSummary(summaryData.data);

      // Process trend data for chart
      const monthlyData = {};
      trendDataRes.data.forEach(item => {
        const month = item._id.period.month;
        if (!monthlyData[month]) {
          monthlyData[month] = { month: getMonthName(month), income: 0, expense: 0 };
        }
        if (item._id.type === 'income') {
          monthlyData[month].income = item.total;
        } else {
          monthlyData[month].expense = item.total;
        }
      });

      // Fill all months
      const allMonths = [];
      for (let i = 1; i <= 12; i++) {
        allMonths.push(monthlyData[i] || { month: getMonthName(i), income: 0, expense: 0 });
      }
      setTrendData(allMonths);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleExportExcel = () => {
    window.open(
      `${API_URL}/api/export/excel?year=${year}`,
      '_blank'
    );
  };

  const handleExportPDF = () => {
    window.open(
      `${API_URL}/api/export/pdf?year=${year}`,
      '_blank'
    );
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="font-medium text-slate-700 mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="ລາຍງານ" 
        subtitle="ວິເຄາະການເງິນຂອງທ່ານ"
      />
      
      <main className="p-8">
        {/* Year Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-slate-500" />
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field w-auto"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>ປີ {y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6 bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-600">ລາຍຮັບລວມ</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(summary.income)}
                </p>
              </div>
              
              <div className="card p-6 bg-gradient-to-br from-red-50 to-rose-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-slate-600">ລາຍຈ່າຍລວມ</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.expense)}
                </p>
              </div>
              
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PieChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-slate-600">ຍອດຄົງເຫຼືອ</span>
                </div>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">
                📊 ແນວໂນ້ມລາຍຮັບ-ລາຍຈ່າຍ ປະຈຳປີ {year}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="income" 
                      name="ລາຍຮັບ" 
                      fill="#22c55e" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="expense" 
                      name="ລາຍຈ່າຍ" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  💰 ລາຍຮັບຕາມໝວດໝູ່
                </h3>
                <CategoryChart data={categoryData.income} />
                
                {/* Top categories list */}
                <div className="mt-6 space-y-3">
                  {categoryData.income.slice(0, 5).map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-slate-700">{cat.name}</span>
                      </div>
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  💸 ລາຍຈ່າຍຕາມໝວດໝູ່
                </h3>
                <CategoryChart data={categoryData.expense} />
                
                {/* Top categories list */}
                <div className="mt-6 space-y-3">
                  {categoryData.expense.slice(0, 5).map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-slate-700">{cat.name}</span>
                      </div>
                      <span className="font-medium text-red-600">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  ))}
                </div>

                

              </div>
              {/* Export Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleExportExcel}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow"
                  >
                    📊 Export Excel
                  </button>

                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow"
                  >
                    📄 Export PDF
                  </button>
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;