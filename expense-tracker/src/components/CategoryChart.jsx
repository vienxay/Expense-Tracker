import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../utils/format';

const CustomTooltip = ({ active, payload, currency, total }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium text-slate-700">{item.name}</span>
        </div>
        <p className="text-lg font-semibold text-slate-800">
          {formatCurrency(item.total, currency)}
        </p>
        <p className="text-sm text-slate-500">
          {((item.total / total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-600">{entry.payload.icon}</span>
          <span className="text-sm text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const CategoryChart = ({ data, currency = 'LAK' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">ບໍ່ມີຂໍ້ມູນ</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="total"
            nameKey="name"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} total={total} />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="relative -mt-52 text-center pointer-events-none">
        <p className="text-sm text-slate-500">ລວມທັງໝົດ</p>
        <p className="text-xl font-bold text-slate-800">
          {formatCurrency(total, currency)}
        </p>
      </div>
    </div>
  );
};

export default CategoryChart;