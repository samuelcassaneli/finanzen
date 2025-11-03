
import React from 'react';
import type { Account, Transaction, Goal } from '../types';
import GlassCard from './GlassCard';
import { WalletIcon, TargetIcon } from './icons';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  onInstallClick: () => void;
  canInstall: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, goals, onInstallClick, canInstall }) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleBackup = () => {
    const dataToBackup = {
      accounts,
      transactions,
      goals,
      backupDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(dataToBackup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzen-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center gap-4 mb-6">
        {canInstall && (
          <button onClick={onInstallClick} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Instalar App
          </button>
        )}
        <button onClick={handleBackup} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Fazer Backup
        </button>
      </div>

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
