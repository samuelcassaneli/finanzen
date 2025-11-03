import type { Account, Transaction, Goal, Category } from '../types';

const DB_NAME = 'FinanZenDB';
const DB_VERSION = 3;

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening db', request.error);
      reject('Error opening db');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('accounts')) {
          db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
          transactionStore.createIndex('accountId', 'accountId', { unique: false });
          transactionStore.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        }
      }
      if (oldVersion < 3) {
        const transactionStore = request.transaction?.objectStore('transactions');
        if (transactionStore && !transactionStore.indexNames.contains('status')) {
          transactionStore.createIndex('status', 'status', { unique: false });
        }
      }
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

// Generic CRUD operations
const getAll = <T,>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};

const add = <T,>(storeName: string, item: Omit<T, 'id'>): Promise<IDBValidKey> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.add(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const update = <T extends { id: any }>(storeName: string, item: T): Promise<IDBValidKey> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.put(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteItem = (storeName: string, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const clearStore = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const bulkAdd = <T,>(storeName: string, items: T[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach(item => store.add(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// Specific functions
export const getAccounts = () => initDB().then(() => getAll<Account>('accounts'));
export const addAccount = (account: Omit<Account, 'id'>) => initDB().then(() => add<Account>('accounts', account));
export const updateAccount = (account: Account) => initDB().then(() => update<Account>('accounts', account));
export const deleteAccount = (id: number) => initDB().then(() => deleteItem('accounts', id));

export const getTransactions = () => initDB().then(() => getAll<Transaction>('transactions'));
export const addTransaction = (transaction: Omit<Transaction, 'id' | 'status'>) => initDB().then(() => add<Transaction>('transactions', { ...transaction, status: 'pending' }));
export const updateTransaction = (transaction: Transaction) => initDB().then(() => update<Transaction>('transactions', transaction));
export const deleteTransaction = (id: number) => initDB().then(() => deleteItem('transactions', id));

export const getGoals = () => initDB().then(() => getAll<Goal>('goals'));
export const addGoal = (goal: Omit<Goal, 'id'>) => initDB().then(() => add<Goal>('goals', goal));
export const updateGoal = (goal: Goal) => initDB().then(() => update<Goal>('goals', goal));
export const deleteGoal = (id: number) => initDB().then(() => deleteItem('goals', id));

export const getCategories = () => initDB().then(() => getAll<Category>('categories'));
export const addCategory = (category: Omit<Category, 'id'>) => initDB().then(() => add<Category>('categories', category));
export const deleteCategory = (id: number) => initDB().then(() => deleteItem('categories', id));

export const restoreBackup = async (data: { accounts: Account[], transactions: Transaction[], goals: Goal[] }) => {
  await initDB();
  await clearStore('transactions');
  await clearStore('goals');
  await clearStore('accounts');
  // Note: Categories are not part of backup/restore for now to keep it simple
  await bulkAdd('accounts', data.accounts);
  await bulkAdd('transactions', data.transactions);
  await bulkAdd('goals', data.goals);
};