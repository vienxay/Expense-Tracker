import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const StatCard = ({ type, amount, count }) => {
  const config = {
    income: {
      icon: TrendingUp,
      label: 'ລາຍຮັບ',
      cardClass: 'income-card',
      amountClass: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    expense: {
      icon: TrendingDown,
      label: 'ລາຍຈ່າຍ',
      cardClass: 'expense-card',
      amountClass: 'text-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500'
    },
    balance: {
      icon: Wallet,
      label: 'ຍອດເງິນຄົງເຫຼືອ',
      cardClass: 'balance-card',
      amountClass: 'text-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const { icon: Icon, label, cardClass, amountClass, iconBg, iconColor } = config[type];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('lo-LA').format(value || 0) + ' ₭';
  };

  return (
    <div className={`stat-card ${cardClass}`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 ${iconBg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
      </div>
      <p className="text-xs md:text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-lg md:text-2xl font-bold ${amountClass} currency`}>
        {formatCurrency(amount)}
      </p>
      {count !== undefined && (
        <p className="text-xs text-slate-400 mt-1">{count} ລາຍການ</p>
      )}
    </div>
  );
};

export default StatCard;