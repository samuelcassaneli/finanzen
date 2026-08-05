import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import { XIcon } from '../icons';
import type { Account } from '../../types';

interface EditAccountModalProps {
  onClose: () => void;
  onUpdateAccount: (account: Account) => void;
  account: Account;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ onClose, onUpdateAccount, account }) => {
  const [name, setName] = useState(account.name);
  const [balance, setBalance] = useState(String(account.balance));
  const [type, setType] = useState(account.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || balance === '') {
      alert('Please fill all fields');
      return;
    }
    onUpdateAccount({
      ...account,
      name,
      balance: parseFloat(balance),
      type,
    });
    onClose();
  };
  
  const commonInputClasses = "w-full bg-gray-900/50 text-white rounded-md border border-white/20 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition px-3 py-2";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast">
      <GlassCard className="w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Account</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="acc-name" className="text-sm text-gray-300 mb-1 block">Account Name</label>
                <input id="acc-name" type="text" value={name} onChange={e => setName(e.target.value)} className={commonInputClasses} placeholder="e.g. Main Checking" required />
            </div>
             <div>
                <label htmlFor="acc-balance" className="text-sm text-gray-300 mb-1 block">Balance</label>
                <input id="acc-balance" type="number" value={balance} onChange={e => setBalance(e.target.value)} className={commonInputClasses} placeholder="0.00" required />
            </div>
             <div>
                <label htmlFor="acc-type" className="text-sm text-gray-300 mb-1 block">Account Type</label>
                <select id="acc-type" value={type} onChange={e => setType(e.target.value as any)} className={commonInputClasses}>
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="investment">Investment</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105">
                Update Account
            </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default EditAccountModal;
