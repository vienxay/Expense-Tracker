import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatCurrency, formatDateLao, getAccountName } from '../utils/format';
import { useApp } from '../context/AppContext';
import TransactionModal from './TransactionModal';

const TransactionList = ({ transactions, showType = true }) => {
  const { deleteTransaction } = useApp();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບທຸລະກຳນີ້?')) {
      setDeletingId(id);
      try {
        await deleteTransaction(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <p className="text-slate-500">ຍັງບໍ່ມີທຸລະກຳ</p>
        <p className="text-sm text-slate-400 mt-1">ເລີ່ມບັນທຶກລາຍຮັບ-ລາຍຈ່າຍຂອງທ່ານ</p>
      </div>
    );
  }

  // Group by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedTransactions).map(([date, items]) => (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium text-slate-500">
                {formatDateLao(new Date(date))}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">
                {items.length} ລາຍການ
              </span>
            </div>

            {/* Transactions */}
            <div className="space-y-2">
              {items.map((transaction) => (
                <div
                  key={transaction._id}
                  className="card p-4 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${transaction.category?.color}20` }}
                    >
                      {transaction.category?.icon || '📝'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-800 truncate">
                          {transaction.category?.name || 'ບໍ່ລະບຸໝວດໝູ່'}
                        </h4>
                        {showType && (
                          transaction.type === 'income' ? (
                            <ArrowUpCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {transaction.description || getAccountName(transaction.account)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className={`font-semibold currency ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {getAccountName(transaction.account)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        disabled={deletingId === transaction._id}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  {transaction.note && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-500 italic">
                        💬 {transaction.note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <TransactionModal
          type={editingTransaction.type}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
};

export default TransactionList;