import React, { useMemo } from 'react';
import type { Account, Transaction } from '../types';
import GlassCard from './GlassCard';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onUpdateStatus: (transaction: Transaction) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, accounts, onEdit, onDelete, onUpdateStatus }) => {

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      const date = new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  const getAccountName = (accountId: number) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'Unknown Account';
  }

  const handleDelete = (tx: Transaction) => {
    if (window.confirm(`Are you sure you want to delete "${tx.description}"?`)) {
      onDelete(tx);
    }
  }

  const toggleStatus = (tx: Transaction) => {
    const newStatus = tx.status === 'pending' ? 'completed' : 'pending';
    onUpdateStatus({ ...tx, status: newStatus });
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">All Transactions</h2>
            {Object.entries(groupedTransactions).length === 0 ? (
                <p className="text-gray-400">No transactions yet.</p>
            ) : (
                <div className="space-y-6">
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                    <h3 className="text-lg font-semibold text-gray-300 mb-3 sticky top-0 bg-gray-900/80 backdrop-blur-lg py-2 -mx-6 px-6">{date}</h3>
                    <div className="space-y-4">
                        {(txs as Transaction[]).map(tx => (
                        <div key={tx.id} className={`flex justify-between items-start p-3 rounded-lg transition-opacity ${tx.status === 'pending' ? 'opacity-60' : 'opacity-100'}`}>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => toggleStatus(tx)}
                                    className={`w-5 h-5 rounded-full border-2 ${tx.status === 'completed' ? 'bg-green-500 border-green-400' : 'border-gray-500'} transition-all`}
                                    title={`Mark as ${tx.status === 'pending' ? 'completed' : 'pending'}`}
                                />
                                <div>
                                    <p className="font-medium text-white">{tx.description}</p>
                                    <p className="text-gray-400 text-sm">{tx.category} · {getAccountName(tx.accountId)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className={`font-semibold text-lg text-right ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => onEdit(tx)} className="text-xs text-gray-400 hover:text-white">Edit</button>
                                    <button onClick={() => handleDelete(tx)} className="text-xs text-red-500 hover:text-red-400">Delete</button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            )}
        </GlassCard>
    </div>
  );
};

export default TransactionsView;
