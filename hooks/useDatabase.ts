
import { useState, useEffect, useCallback } from 'react';
import type { Account, Transaction, Goal } from '../types';
import { getAccounts, addAccount, getTransactions, addTransaction, getGoals, addGoal, updateAccount } from '../services/db';

export const useDatabase = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [accs, trans, gls] = await Promise.all([
        getAccounts(),
        getTransactions(),
        getGoals(),
      ]);
      setAccounts(accs);
      setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setGoals(gls);

    } catch (e) {
      setError('Failed to load data from the database.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
      await addTransaction(transaction);
      
      const targetAccount = accounts.find(acc => acc.id === transaction.accountId);
      if(targetAccount){
          const newBalance = transaction.type === 'income' 
              ? targetAccount.balance + transaction.amount 
              : targetAccount.balance - transaction.amount;
          await updateAccount({ ...targetAccount, balance: newBalance });
      }
      await refreshData();
  }

  const handleAddAccount = async (account: Omit<Account, 'id'>) => {
    await addAccount(account);
    await refreshData();
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id'>) => {
    await addGoal(goal);
    await refreshData();
  };

  return { accounts, transactions, goals, loading, error, refreshData, handleAddTransaction, handleAddAccount, handleAddGoal };
};
