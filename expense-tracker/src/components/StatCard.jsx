import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const StatCard = ({ type, amount, count, currency = 'LAK' }) => {
  const configs = {
    income: {
      title: 'ລາຍຮັບທັງໝົດ',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-600'
    },
    expense: {
      title: 'ລາຍຈ່າຍທັງໝົດ',
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    balance: {
      title: 'ຍອດຄົງເຫຼືອ',
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`card p-6 bg-gradient-to-br ${config.bgGradient} relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
      {/* Background decoration */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 group-hover:scale-110 transition-transform duration-500`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${config.iconBg}`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          {count !== undefined && (
            <span className="text-sm text-slate-500 bg-white/50 px-3 py-1 rounded-full">
              {count} ລາຍການ
            </span>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="text-sm text-slate-600 mb-1">{config.title}</p>
          <p className={`text-2xl font-bold ${config.textColor} currency`}>
            {formatCurrency(amount, currency)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;