
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

      // Seed data if database is empty
      if (accs.length === 0 && trans.length === 0) {
        await seedData();
        await refreshData(); // Re-fetch after seeding
      }

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

  const seedData = async () => {
    console.log("Seeding initial data...");
    const newAccountId = await addAccount({ name: 'Checking Account', balance: 5000, type: 'checking' }) as number;
    await addAccount({ name: 'Savings Account', balance: 15000, type: 'savings' });
    await addTransaction({ accountId: newAccountId, description: 'Paycheck', amount: 3000, type: 'income', category: 'Salary', date: new Date().toISOString() });
    await addTransaction({ accountId: newAccountId, description: 'Groceries', amount: 150, type: 'expense', category: 'Food', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() });
    await addTransaction({ accountId: newAccountId, description: 'Rent', amount: 1200, type: 'expense', category: 'Housing', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() });
    await addTransaction({ accountId: newAccountId, description: 'Internet Bill', amount: 60, type: 'expense', category: 'Utilities', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() });
    await addGoal({ name: 'Japan Trip', targetAmount: 4000, currentAmount: 500, deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() });
  };
  
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
