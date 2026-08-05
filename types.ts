
export interface Account {
  id: number;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit_card' | 'investment';
}

export interface Transaction {
  id: number;
  accountId: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO string format
  status: 'pending' | 'completed';
}

export interface Goal {
  id: number;
  name:string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string format
}

export interface Category {
  id: number;
  name: string;
}

export enum View {
  Dashboard,
  Transactions,
  Goals,
  Accounts,
  Reports,
  Settings,
}
