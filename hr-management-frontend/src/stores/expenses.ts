import  {defineStore} from 'pinia'
import {ref,computed} from 'vue'
import axios from '@/lib/axios.ts'

// Expense interfaces
export interface ExpenseUser {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  receipt_number?: string;
  notes?: string;
  user: ExpenseUser;
  created_at: string;
  updated_at: string;
}

export interface ExpensePaginatedResponse {
  data: Expense[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ExpenseRequest {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  receipt_number?: string;
  notes?: string;
}

export interface ExpenseCreateUpdateResponse {
  message: string;
  expense: Expense;
}

export interface ExpenseDeleteResponse {
  message: string;
}

export type ExpenseCategoriesResponse = string[];

export interface ExpenseSummaryCategory {
  category: string;
  total: number;
}

export interface ExpenseSummaryResponse {
  total_expenses: number;
  expenses_by_category: ExpenseSummaryCategory[];
}

export const useExpensesStore = defineStore('expenses', () => {
  // State
  const expenses = ref<ExpensePaginatedResponse | null>(null);
  const expense = ref<Expense | null>(null);
  const categories = ref<ExpenseCategoriesResponse>([]);
  const summary = ref<ExpenseSummaryResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const expenseList = computed(() => expenses.value?.data || []);
  const expenseDetail = computed(() => expense.value);
  const categoryList = computed(() => categories.value);
  const summaryStats = computed(() => summary.value);

  // Actions
  async function fetchExpenses(params: { search?: string; start_date?: string; end_date?: string; category?: string; page?: number; per_page?: number } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ExpensePaginatedResponse>('/api/expenses', { params });
      expenses.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch expenses.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchExpense(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<Expense>(`/api/expenses/${id}`);
      expense.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch expense.';
    } finally {
      loading.value = false;
    }
  }

  async function createExpense(payload: ExpenseRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<ExpenseCreateUpdateResponse>('/api/expenses', payload);
      expense.value = response.data.expense;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create expense.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateExpense(id: number, payload: Partial<ExpenseRequest>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put<ExpenseCreateUpdateResponse>(`/api/expenses/${id}`, payload);
      expense.value = response.data.expense;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update expense.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteExpense(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.delete<ExpenseDeleteResponse>(`/api/expenses/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete expense.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ExpenseCategoriesResponse>('/api/expenses/categories');
      categories.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSummary(params: { start_date?: string; end_date?: string } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ExpenseSummaryResponse>('/api/expenses/summary', { params });
      summary.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch expense summary.';
    } finally {
      loading.value = false;
    }
  }

  return {
    expenses,
    expense,
    categories,
    summary,
    loading,
    error,
    expenseList,
    expenseDetail,
    categoryList,
    summaryStats,
    fetchExpenses,
    fetchExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchCategories,
    fetchSummary,
  };
});
