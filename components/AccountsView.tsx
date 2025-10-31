
import React from 'react';
import type { Account } from '../types';
import GlassCard from './GlassCard';
import { PlusIcon } from './icons';

interface AccountsViewProps {
  accounts: Account[];
  onAddAccount: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const AccountTypeLabels: Record<Account['type'], string> = {
    checking: 'Checking',
    savings: 'Savings',
    credit_card: 'Credit Card',
    investment: 'Investment'
}

const AccountsView: React.FC<AccountsViewProps> = ({ accounts, onAddAccount }) => {
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Accounts</h2>
            <button onClick={onAddAccount} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                <PlusIcon className="w-5 h-5" />
                <span>Add Account</span>
            </button>
        </div>
        {accounts.length === 0 ? (
            <GlassCard><p className="text-gray-400">No accounts yet. Add one to get started!</p></GlassCard>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(account => (
                    <GlassCard key={account.id}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{account.name}</h3>
                                <p className="text-gray-400">{AccountTypeLabels[account.type]}</p>
                            </div>
                            <p className={`text-lg font-semibold ${account.balance >= 0 ? 'text-cyan-300' : 'text-red-400'}`}>
                                {formatCurrency(account.balance)}
                            </p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        )}
    </div>
  );
};

export default AccountsView;
