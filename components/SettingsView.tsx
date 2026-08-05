import React, { useRef, useState } from 'react';
import type { Account, Transaction, Goal, Category } from '../types';
import GlassCard from './GlassCard';
import { View } from '../types';

interface SettingsProps {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
  onInstallClick: () => void;
  canInstall: boolean;
  onRestore: (data: { accounts: Account[], transactions: Transaction[], goals: Goal[] }) => Promise<void>;
  setCurrentView: (view: View) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

const SettingsView: React.FC<SettingsProps> = ({ accounts, transactions, goals, categories, onInstallClick, canInstall, onRestore, setCurrentView, onAddCategory, onDeleteCategory }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCategory, setNewCategory] = useState('');

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

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File is not valid text');
        
        const data = JSON.parse(text);

        if (!data.accounts || !data.transactions || !data.goals) {
          throw new Error('Invalid backup file format.');
        }

        if (window.confirm('Are you sure you want to restore? This will overwrite all current data.')) {
          await onRestore(data);
          alert('Restore successful!');
        }
      } catch (error) {
        console.error('Failed to restore backup:', error);
        alert('Failed to restore backup. Please check the file and try again.');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    onAddCategory({ name: newCategory.trim() });
    setNewCategory('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4 text-gray-100">App & Data</h3>
        <div className="flex flex-wrap gap-4">
          {canInstall && (
            <button onClick={onInstallClick} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Install App
            </button>
          )}
          <button onClick={handleBackup} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Backup Data
          </button>
          <button onClick={handleRestoreClick} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Restore from Backup
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden" 
            accept=".json"
          />
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-xl font-semibold mb-4 text-gray-100">Manage Accounts</h3>
        <div className="flex justify-center">
          <button onClick={() => setCurrentView(View.Accounts)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Go to Accounts
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-xl font-semibold mb-4 text-gray-100">Manage Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-md">
              <span>{cat.name}</span>
              <button onClick={() => onDeleteCategory(cat.id)} className="text-red-500 hover:text-red-400 text-xs">Delete</button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input 
            type="text" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-grow bg-gray-800/60 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button onClick={handleAddCategory} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Add
          </button>
        </div>
      </GlassCard>

    </div>
  );
};

export default SettingsView;