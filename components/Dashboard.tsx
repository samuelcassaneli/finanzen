
import React from 'react';
import type { Account, Transaction, Goal } from '../types';
import GlassCard from './GlassCard';
import { WalletIcon, TargetIcon } from './icons';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, goals }) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassCard className="text-center">
        <h2 className="text-lg font-semibold text-gray-300">Total Balance</h2>
        <p className="text-4xl font-bold text-cyan-400 tracking-tight">{formatCurrency(totalBalance)}</p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Recent Transactions</h3>
            <div className="space-y-3">
            {recentTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center text-sm">
                <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <p className={`font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
                </div>
            ))}
            </div>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-gray-100">Savings Goals</h3>
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <p className="font-medium text-white">{goal.name}</p>
                  <p className="text-cyan-400 font-semibold">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
