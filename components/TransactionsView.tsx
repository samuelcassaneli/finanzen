import React, { useMemo } from 'react';
import type { Account, Transaction } from '../types';
import GlassCard from './GlassCard';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, accounts }) => {

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
                        {/* Fix: Cast `txs` to Transaction[] as Object.entries may not infer the type correctly, causing `map` to be called on an `unknown` type. */}
                        {(txs as Transaction[]).map(tx => (
                        <div key={tx.id} className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-white">{tx.description}</p>
                                <p className="text-gray-400 text-sm">{tx.category} · {getAccountName(tx.accountId)}</p>
                            </div>
                            <p className={`font-semibold text-lg text-right ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                            </p>
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