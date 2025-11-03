import React from 'react';
import type { Goal } from '../types';
import GlassCard from './GlassCard';
import { PlusIcon, TargetIcon } from './icons';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, onEdit, onDelete }) => {

  const handleDelete = (goal: Goal) => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      onDelete(goal.id);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Savings Goals</h2>
            <button onClick={onAddGoal} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                <PlusIcon className="w-5 h-5" />
                <span>Add Goal</span>
            </button>
        </div>
        {goals.length === 0 ? (
            <GlassCard><p className="text-gray-400">No goals yet. Set a goal to start saving!</p></GlassCard>
        ) : (
            <div className="space-y-6">
                {goals.map(goal => (
                    <GlassCard key={goal.id}>
                         <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                                <TargetIcon className="w-6 h-6 text-cyan-400" />
                                <h3 className="text-xl font-semibold text-white">{goal.name}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-gray-300 text-sm">
                                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                </p>
                                <button onClick={() => onEdit(goal)} className="text-xs text-gray-300 hover:text-white transition">Edit</button>
                                <button onClick={() => handleDelete(goal)} className="text-xs text-red-500 hover:text-red-400 transition">Delete</button>
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 my-3">
                            <div className="bg-cyan-500 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}>
                                {goal.targetAmount > 0 ? `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%` : 'N/A'}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-sm text-gray-300">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span className="font-semibold text-gray-100">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                    </GlassCard>
                ))}
            </div>
        )}
    </div>
  );
};

export default GoalsView;