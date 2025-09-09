export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  profile_picture?: string;
  currency: string;
  created_at: string;
}

export interface Family {
  id: number;
  name: string;
  description?: string;
  created_by: User;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: number;
  user: User;
  family: Family;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  family: number;
  created_by: string;
  expense_count: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  name: string;
  description?: string;
  family: number;
  category: Category;
  amount: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  spent_amount: number;
  remaining_amount: number;
  spent_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: string; // String representation from StringRelatedField
  family: string; // String representation from StringRelatedField
  paid_by: string;
  date: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
  receipt_image?: string;
  tags?: string;
  tag_list: string[];
  created_at: string;
  updated_at: string;
}

export interface RecurringExpense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: Category;
  family: number;
  paid_by: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  payment_method: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseShare {
  id: number;
  expense: number;
  user: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExpenseStatistics {
  total_expenses: number;
  expense_count: number;
  period: string;
  start_date: string;
  end_date: string;
  expenses_by_category: Array<{
    category__name: string;
    total: number;
    count: number;
  }>;
  expenses_by_payment: Array<{
    payment_method: string;
    total: number;
    count: number;
  }>;
  daily_expenses: Array<{
    day: string;
    total: number;
  }>;
}

