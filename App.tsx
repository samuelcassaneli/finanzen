
import React, { useState, useEffect } from 'react';
import { useDatabase } from './hooks/useDatabase';
import Dashboard from './components/Dashboard';
import FloatingMenu from './components/FloatingMenu';
import AddTransactionModal from './components/modals/AddTransactionModal';
import AddAccountModal from './components/modals/AddAccountModal';
import AddGoalModal from './components/modals/AddGoalModal';
import TransactionsView from './components/TransactionsView';
import AccountsView from './components/AccountsView';
import GoalsView from './components/GoalsView';
import ReportsView from './components/ReportsView';
import { View } from './types';
import type { Account, Transaction, Goal } from './types';

const App: React.FC = () => {
  const { accounts, transactions, goals, loading, error, handleAddTransaction, handleAddAccount, handleAddGoal } = useDatabase();
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard 
                  accounts={accounts} 
                  transactions={transactions} 
                  goals={goals} 
                  onInstallClick={handleInstallClick} 
                  canInstall={!!installPrompt} 
               />;
      case View.Transactions:
          return <TransactionsView transactions={transactions} accounts={accounts} />;
      case View.Goals:
          return <GoalsView goals={goals} onAddGoal={() => setIsGoalModalOpen(true)} />;
      case View.Accounts:
          return <AccountsView accounts={accounts} onAddAccount={() => setIsAccountModalOpen(true)} />;
      case View.Reports:
          return <ReportsView transactions={transactions} />;
      default:
        return <Dashboard 
                  accounts={accounts} 
                  transactions={transactions} 
                  goals={goals} 
                  onInstallClick={handleInstallClick} 
                  canInstall={!!installPrompt} 
               />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl font-semibold">Loading Financial Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
        <div className="text-2xl font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8 relative pb-28">
      <header className="mb-8" onClick={() => setCurrentView(View.Dashboard)} style={{cursor: 'pointer'}}>
        <h1 className="text-4xl font-bold text-white">Finan<span className="text-cyan-400">Zen</span></h1>
        <p className="text-gray-400">Your personal finance dashboard.</p>
      </header>
      
      <main>
        {renderView()}
      </main>

      <FloatingMenu onAddTransaction={() => setIsTxModalOpen(true)} setCurrentView={setCurrentView} />
      
      {isTxModalOpen && (
        <AddTransactionModal 
            onClose={() => setIsTxModalOpen(false)} 
            onAddTransaction={(newTx: Omit<Transaction, 'id'>) => {
                handleAddTransaction(newTx);
            }}
            accountId={accounts[0]?.id || 1} // Default to first account
        />
      )}
      {isAccountModalOpen && (
        <AddAccountModal
            onClose={() => setIsAccountModalOpen(false)}
            onAddAccount={(newAccount: Omit<Account, 'id'>) => {
                handleAddAccount(newAccount);
            }}
        />
      )}
      {isGoalModalOpen && (
        <AddGoalModal
            onClose={() => setIsGoalModalOpen(false)}
            onAddGoal={(newGoal: Omit<Goal, 'id'>) => {
                handleAddGoal(newGoal);
            }}
        />
      )}
       <style>{`
          @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }

          @keyframes fade-in-fast {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
