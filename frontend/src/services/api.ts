import axios from 'axios';
import { 
  User, 
  Family, 
  FamilyMember, 
  Category, 
  Budget, 
  Expense, 
  RecurringExpense,
  AuthResponse,
  ExpenseStatistics
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    phone?: string | null;
    date_of_birth?: string | null;
  }): Promise<AuthResponse> => 
    api.post('/auth/register/', userData).then(res => res.data),

  login: (credentials: { email: string; password: string }): Promise<AuthResponse> =>
    api.post('/auth/login/', credentials).then(res => res.data),

  logout: (): Promise<void> =>
    api.post('/auth/logout/').then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }),

  getProfile: (): Promise<User> =>
    api.get('/auth/profile/').then(res => res.data),

  updateProfile: (userData: Partial<User>): Promise<User> =>
    api.patch('/auth/profile/', userData).then(res => res.data),
};

// Family API
export const familyAPI = {
  getFamilies: (): Promise<Family[]> =>
    api.get('/auth/families/').then(res => res.data.results || res.data),

  createFamily: (familyData: { name: string; description?: string }): Promise<Family> =>
    api.post('/auth/families/', familyData).then(res => res.data),

  getFamily: (id: number): Promise<Family> =>
    api.get(`/auth/families/${id}/`).then(res => res.data),

  updateFamily: (id: number, familyData: Partial<Family>): Promise<Family> =>
    api.patch(`/auth/families/${id}/`, familyData).then(res => res.data),

  deleteFamily: (id: number): Promise<void> =>
    api.delete(`/auth/families/${id}/`),

  getFamilyMembers: (familyId: number): Promise<FamilyMember[]> =>
    api.get(`/auth/families/${familyId}/members/`).then(res => res.data.results || res.data),

  addFamilyMember: (familyId: number, memberData: { user: number; role: string }): Promise<FamilyMember> =>
    api.post(`/auth/families/${familyId}/members/`, memberData).then(res => res.data),

  inviteFamilyMember: (familyId: number, email: string): Promise<FamilyMember> =>
    api.post(`/auth/families/${familyId}/invite/`, { email }).then(res => res.data),

  updateFamilyMember: (familyId: number, memberId: number, memberData: Partial<FamilyMember>): Promise<FamilyMember> =>
    api.patch(`/auth/families/${familyId}/members/${memberId}/`, memberData).then(res => res.data),

  removeFamilyMember: (familyId: number, memberId: number): Promise<void> =>
    api.delete(`/auth/families/${familyId}/members/${memberId}/`),
};

// Category API
export const categoryAPI = {
  getCategories: (familyId?: number): Promise<Category[]> => {
    const params = familyId ? { family: familyId } : {};
    return api.get('/budgets/categories/', { params }).then(res => res.data.results || res.data);
  },

  createCategory: (categoryData: {
    name: string;
    description?: string;
    color: string;
    icon?: string;
    family: number;
  }): Promise<Category> =>
    api.post('/budgets/categories/', categoryData).then(res => res.data),

  getCategory: (id: number): Promise<Category> =>
    api.get(`/budgets/categories/${id}/`).then(res => res.data),

  updateCategory: (id: number, categoryData: Partial<Category>): Promise<Category> =>
    api.patch(`/budgets/categories/${id}/`, categoryData).then(res => res.data),

  deleteCategory: (id: number): Promise<void> =>
    api.delete(`/budgets/categories/${id}/`),
};

// Budget API
export const budgetAPI = {
  getBudgets: (familyId?: number): Promise<Budget[]> => {
    const params = familyId ? { family: familyId } : {};
    return api.get('/budgets/budgets/', { params }).then(res => res.data.results || res.data);
  },

  getActiveBudgets: (familyId?: number): Promise<Budget[]> => {
    const params = familyId ? { family: familyId } : {};
    return api.get('/budgets/budgets/active/', { params }).then(res => res.data.results || res.data);
  },

  createBudget: (budgetData: {
    name: string;
    description?: string;
    family: number;
    category: number;
    amount: number;
    period: 'monthly' | 'yearly';
    start_date: string;
    end_date: string;
    is_active?: boolean;
  }): Promise<Budget> =>
    api.post('/budgets/budgets/', budgetData).then(res => res.data),

  getBudget: (id: number): Promise<Budget> =>
    api.get(`/budgets/budgets/${id}/`).then(res => res.data),

  updateBudget: (id: number, budgetData: Partial<Budget>): Promise<Budget> =>
    api.patch(`/budgets/budgets/${id}/`, budgetData).then(res => res.data),

  deleteBudget: (id: number): Promise<void> =>
    api.delete(`/budgets/budgets/${id}/`),
};

// Expense API
export const expenseAPI = {
  getExpenses: (familyId?: number): Promise<Expense[]> => {
    const params = familyId ? { family: familyId } : {};
    return api.get('/expenses/expenses/', { params }).then(res => res.data.results || res.data);
  },

  createExpense: (expenseData: {
    title: string;
    description?: string;
    amount: number;
    category: number;
    family: number;
    date: string;
    payment_method: string;
    receipt_image?: File;
    tags?: string;
  }): Promise<Expense> =>
    api.post('/expenses/expenses/', expenseData).then(res => res.data),

  getExpense: (id: number): Promise<Expense> =>
    api.get(`/expenses/expenses/${id}/`).then(res => res.data),

  updateExpense: (id: number, expenseData: Partial<Expense>): Promise<Expense> =>
    api.patch(`/expenses/expenses/${id}/`, expenseData).then(res => res.data),

  deleteExpense: (id: number): Promise<void> =>
    api.delete(`/expenses/expenses/${id}/`),

  getExpenseStatistics: (familyId?: number, period?: string): Promise<ExpenseStatistics> => {
    const params: any = {};
    if (familyId) params.family_id = familyId;
    if (period) params.period = period;
    return api.get('/expenses/statistics/', { params }).then(res => res.data);
  },

  getRecentExpenses: (familyId?: number, limit?: number): Promise<Expense[]> => {
    const params: any = {};
    if (familyId) params.family_id = familyId;
    if (limit) params.limit = limit;
    return api.get('/expenses/recent/', { params }).then(res => res.data);
  },
};

// Recurring Expense API
export const recurringExpenseAPI = {
  getRecurringExpenses: (familyId?: number): Promise<RecurringExpense[]> => {
    const params = familyId ? { family: familyId } : {};
    return api.get('/expenses/recurring-expenses/', { params }).then(res => res.data.results || res.data);
  },

  createRecurringExpense: (expenseData: {
    title: string;
    description?: string;
    amount: number;
    category: number;
    family: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    end_date?: string;
    payment_method: string;
    is_active?: boolean;
  }): Promise<RecurringExpense> =>
    api.post('/expenses/recurring-expenses/', expenseData).then(res => res.data),

  getRecurringExpense: (id: number): Promise<RecurringExpense> =>
    api.get(`/expenses/recurring-expenses/${id}/`).then(res => res.data),

  updateRecurringExpense: (id: number, expenseData: Partial<RecurringExpense>): Promise<RecurringExpense> =>
    api.patch(`/expenses/recurring-expenses/${id}/`, expenseData).then(res => res.data),

  deleteRecurringExpense: (id: number): Promise<void> =>
    api.delete(`/expenses/recurring-expenses/${id}/`),
};

export default api;
