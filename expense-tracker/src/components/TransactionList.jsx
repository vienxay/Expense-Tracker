import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import TransactionModal from './TransactionModal';

const TransactionList = ({ transactions = [], onUpdate }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit' | 'delete'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' ₭';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('lo-LA', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleEdit = (e, transaction) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (e, transaction) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
    setModalMode('delete');
    setIsModalOpen(true);
  };

  const handleItemClick = (transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleSuccess = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      window.location.reload();
    }
  };

  // ຈັດກຸ່ມ transactions ຕາມວັນທີ
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <span className="text-2xl">📭</span>
        </div>
        <h3 className="empty-state-title">ບໍ່ມີທຸລະກຳ</h3>
        <p className="empty-state-text">ຍັງບໍ່ມີທຸລະກຳໃນຊ່ວງເວລານີ້</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {Object.entries(groupedTransactions).map(([date, items]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-sm font-medium text-slate-500">
                {new Date(date).toLocaleDateString('lo-LA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h4>
              <span className="text-xs text-slate-400">{items.length} ລາຍການ</span>
            </div>

            {/* Transaction Items */}
            <div className="space-y-2">
              {items.map((transaction) => (
                <div
                  key={transaction._id}
                  onClick={() => handleItemClick(transaction)}
                  className="group transaction-item cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
                >
                  {/* Icon */}
                  <div className={`transaction-icon ${
                    transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <span className="text-xl">
                      {transaction.category?.icon || (transaction.type === 'income' ? '💰' : '💸')}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="transaction-info">
                    <p className="transaction-name">
                      {transaction.description || transaction.category?.name || 'ບໍ່ລະບຸ'}
                    </p>
                    <p className="transaction-category">
                      {transaction.category?.name || 'ບໍ່ມີໝວດໝູ່'}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right mr-2">
                    <p className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 md:hidden">
                      {formatDate(transaction.date)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleEdit(e, transaction)}
                      className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 
                               flex items-center justify-center transition-colors"
                      title="ແກ້ໄຂ"
                    >
                      <Pencil className="w-4 h-4 text-emerald-600" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, transaction)}
                      className="w-9 h-9 rounded-xl bg-red-100 hover:bg-red-200 
                               flex items-center justify-center transition-colors"
                      title="ລົບ"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transaction={selectedTransaction}
        onSuccess={handleSuccess}
        initialMode={modalMode}
      />
    </>
  );
};

export default TransactionList;