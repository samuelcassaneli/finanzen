
import type { Account, Transaction, Goal } from '../types';

const DB_NAME = 'FinanZenDB';
const DB_VERSION = 1;

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

// Specific functions
export const getAccounts = () => initDB().then(() => getAll<Account>('accounts'));
export const addAccount = (account: Omit<Account, 'id'>) => initDB().then(() => add<Account>('accounts', account));
export const updateAccount = (account: Account) => initDB().then(() => update<Account>('accounts', account));

export const getTransactions = () => initDB().then(() => getAll<Transaction>('transactions'));
export const addTransaction = (transaction: Omit<Transaction, 'id'>) => initDB().then(() => add<Transaction>('transactions', transaction));

export const getGoals = () => initDB().then(() => getAll<Goal>('goals'));
export const addGoal = (goal: Omit<Goal, 'id'>) => initDB().then(() => add<Goal>('goals', goal));
