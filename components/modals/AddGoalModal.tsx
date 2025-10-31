
import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import { XIcon } from '../icons';
import type { Goal } from '../../types';

interface AddGoalModalProps {
  onClose: () => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onAddGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) {
      alert('Please fill all required fields');
      return;
    }
    onAddGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: new Date(deadline).toISOString(),
    });
    onClose();
  };
  
  const commonInputClasses = "w-full bg-gray-900/50 text-white rounded-md border border-white/20 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition px-3 py-2";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast">
      <GlassCard className="w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add Savings Goal</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="goal-name" className="text-sm text-gray-300 mb-1 block">Goal Name</label>
                <input id="goal-name" type="text" value={name} onChange={e => setName(e.target.value)} className={commonInputClasses} placeholder="e.g. New Car" required />
            </div>
             <div>
                <label htmlFor="goal-target" className="text-sm text-gray-300 mb-1 block">Target Amount</label>
                <input id="goal-target" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className={commonInputClasses} placeholder="5000.00" required />
            </div>
            <div>
                <label htmlFor="goal-current" className="text-sm text-gray-300 mb-1 block">Current Amount (Optional)</label>
                <input id="goal-current" type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className={commonInputClasses} placeholder="0.00" />
            </div>
             <div>
                <label htmlFor="goal-deadline" className="text-sm text-gray-300 mb-1 block">Deadline</label>
                <input id="goal-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={`${commonInputClasses} `} required />
            </div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105">
                Add Goal
            </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default AddGoalModal;
