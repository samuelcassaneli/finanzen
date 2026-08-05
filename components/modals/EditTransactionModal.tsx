import React, { useState, useEffect } from 'react';
import GlassCard from '../GlassCard';
import { XIcon } from '../icons';
import type { Transaction, Category } from '../../types';

interface EditTransactionModalProps {
  onClose: () => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  transaction: Transaction;
  categories: Category[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ onClose, onUpdateTransaction, transaction, categories }) => {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(new Date(transaction.date).toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
      alert('Please fill all fields');
      return;
    }
    onUpdateTransaction({
      ...transaction,
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date).toISOString(),
    });
    onClose();
  };
  
  const commonInputClasses = "w-full bg-gray-900/50 text-white rounded-md border border-white/20 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition px-3 py-2";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast">
      <GlassCard className="w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <div className="flex bg-gray-800/60 rounded-lg p-1">
                    <button type="button" onClick={() => setType('expense')} className={`w-1/2 rounded-md py-2 text-sm font-medium transition ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                        Expense
                    </button>
                     <button type="button" onClick={() => setType('income')} className={`w-1/2 rounded-md py-2 text-sm font-medium transition ${type === 'income' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
                        Income
                    </button>
                </div>
            </div>
            <div>
                <label className="text-sm text-gray-300 mb-1 block">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={commonInputClasses} placeholder="e.g. Coffee" />
            </div>
             <div>
                <label className="text-sm text-gray-300 mb-1 block">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={commonInputClasses} placeholder="0.00" />
            </div>
             <div>
                <label className="text-sm text-gray-300 mb-1 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={commonInputClasses}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
            </div>
             <div>
                <label className="text-sm text-gray-300 mb-1 block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${commonInputClasses} `} />
            </div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105">
                Update Transaction
            </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default EditTransactionModal;
