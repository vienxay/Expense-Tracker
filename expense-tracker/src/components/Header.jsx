import React, { useState } from 'react';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import TransactionModal from './TransactionModal';

const Header = ({ title, subtitle }) => {
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');

  const handleAddClick = (type) => {
    setTransactionType(type);
    setShowModal(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາ..."
                className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 bg-white/50 
                         focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                         transition-all text-sm"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Add buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddClick('income')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 
                         rounded-xl hover:bg-emerald-200 transition-all font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">ລາຍຮັບ</span>
              </button>
              <button
                onClick={() => handleAddClick('expense')}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 
                         rounded-xl hover:bg-red-200 transition-all font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">ລາຍຈ່າຍ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          type={transactionType}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default Header;