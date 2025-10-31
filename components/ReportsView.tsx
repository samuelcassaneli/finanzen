import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import GlassCard from './GlassCard';
import { ChartIcon } from './icons';

interface ReportsViewProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const colors = [
    'bg-cyan-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'
];

const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
    const expenseByCategory = useMemo(() => {
        const expenses = transactions.filter(tx => tx.type === 'expense');
        const categoryMap = expenses.reduce((acc, tx) => {
            const categoryKey = tx.category.trim() === '' ? 'Uncategorized' : tx.category;
            if (!acc[categoryKey]) {
                acc[categoryKey] = 0;
            }
            acc[categoryKey] += tx.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryMap)
            // Fix: Cast `amount` to number as `Object.entries` infers it as `unknown`, causing errors in arithmetic operations like in `.sort()`.
            .map(([category, amount]) => ({ category, amount: amount as number }))
            .sort((a, b) => b.amount - a.amount);

    }, [transactions]);

    const totalExpenses = useMemo(() => expenseByCategory.reduce((sum, item) => sum + item.amount, 0), [expenseByCategory]);

    return (
        <div className="space-y-6 animate-fade-in">
            <GlassCard>
                <div className="flex items-center gap-3 mb-6">
                    <ChartIcon className="w-6 h-6 text-cyan-400"/>
                    <h2 className="text-2xl font-bold text-white">Expense Report</h2>
                </div>
                {totalExpenses === 0 ? (
                    <p className="text-gray-400">No expense data available to generate a report.</p>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-300">Total Expenses: <span className="font-bold text-red-400">{formatCurrency(totalExpenses)}</span></p>
                        <div className="space-y-3 pt-2">
                        {expenseByCategory.map((item, index) => (
                            <div key={item.category}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium text-white">{item.category}</span>
                                    <span className="text-gray-300">{formatCurrency(item.amount)} ({Math.round((item.amount / totalExpenses) * 100)}%)</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className={`${colors[index % colors.length]} h-2.5 rounded-full`}
                                        style={{ width: `${(item.amount / totalExpenses) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default ReportsView;