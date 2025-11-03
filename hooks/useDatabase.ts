import { useState, useEffect, useCallback } from 'react';
import type { Account, Transaction, Goal, Category } from '../types';
import { 
  getAccounts, addAccount, updateAccount, deleteAccount,
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getGoals, addGoal, updateGoal, deleteGoal,
  getCategories, addCategory, deleteCategory, 
  restoreBackup 
} from '../services/db';

export const useDatabase = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [accs, trans, gls, cats] = await Promise.all([
        getAccounts(),
        getTransactions(),
        getGoals(),
        getCategories(),
      ]);
      setAccounts(accs);
      setTransactions(trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setGoals(gls);
      setCategories(cats);

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
  
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'status'>) => {
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

  const handleUpdateTransaction = async (transaction: Transaction) => {
    await updateTransaction(transaction);
    // Note: This doesn't automatically adjust account balance on edit for simplicity.
    // A more robust solution would calculate the difference and update the account.
    await refreshData();
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    await deleteTransaction(transaction.id);
    // Adjust account balance after deletion
    const targetAccount = accounts.find(acc => acc.id === transaction.accountId);
    if(targetAccount){
        const newBalance = transaction.type === 'income' 
            ? targetAccount.balance - transaction.amount // Revert income
            : targetAccount.balance + transaction.amount; // Revert expense
        await updateAccount({ ...targetAccount, balance: newBalance });
    }
    await refreshData();
  }

  const handleAddAccount = async (account: Omit<Account, 'id'>) => {
    await addAccount(account);
    await refreshData();
  };

  const handleUpdateAccount = async (account: Account) => {
    await updateAccount(account);
    await refreshData();
  };

  const handleDeleteAccount = async (id: number) => {
    // Optional: Add logic here to handle transactions associated with the deleted account.
    // For now, we just delete the account.
    await deleteAccount(id);
    await refreshData();
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id'>) => {
    await addGoal(goal);
    await refreshData();
  };

  const handleUpdateGoal = async (goal: Goal) => {
    await updateGoal(goal);
    await refreshData();
  };

  const handleDeleteGoal = async (id: number) => {
    await deleteGoal(id);
    await refreshData();
  };

  const handleRestoreBackup = async (data: { accounts: Account[], transactions: Transaction[], goals: Goal[] }) => {
    await restoreBackup(data);
    await refreshData();
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    await addCategory(category);
    await refreshData();
  };

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(id);
    await refreshData();
  };

  return { 
    accounts, transactions, goals, categories, loading, error, refreshData, 
    handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction, 
    handleAddAccount, handleUpdateAccount, handleDeleteAccount, 
    handleAddGoal, handleUpdateGoal, handleDeleteGoal, 
    handleRestoreBackup, handleAddCategory, handleDeleteCategory 
  };
};