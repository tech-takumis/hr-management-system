import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '@/lib/axios.ts';

// Report interfaces
export interface ReportUser {
  id: number;
  name: string;
}

export interface ReportPeriod {
  start_date: string;
  end_date: string;
}

export interface ReportData {
  sales: {
    total: number;
    count: number;
    average: number;
  };
  expenses: {
    total: number;
    count: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
}

export interface Report {
  id: number;
  user: ReportUser;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'profit_loss';
  start_date: string;
  end_date: string;
  data: ReportData;
  created_at: string;
  updated_at: string;
}

export interface ReportPaginatedResponse {
  data: Report[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ReportGenerateRequest {
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'profit_loss';
  start_date: string;
  end_date: string;
}

export interface ReportCreateResponse {
  message: string;
  report: Report;
}

export interface ReportDeleteResponse {
  message: string;
}

// Sales report response
export interface SalesReportSummary {
  total_sales: number;
  total_transactions: number;
  average_transaction: number;
  total_tax: number;
  total_discount: number;
  payment_methods: Record<string, { count: number; total: number }>;
}

export interface SalesReportResponse {
  period: ReportPeriod;
  summary: SalesReportSummary;
  sales: any[]; // You can define a more detailed Sale type if needed
}

// Expense report response
export interface ExpenseReportSummary {
  total_expenses: number;
  total_transactions: number;
  by_category: Record<string, { count: number; total: number }>;
}

export interface ExpenseReportResponse {
  period: ReportPeriod;
  summary: ExpenseReportSummary;
  expenses: any[]; // You can define a more detailed Expense type if needed
}

export const useReportStore = defineStore('report', () => {
  // State
  const reports = ref<ReportPaginatedResponse | null>(null);
  const report = ref<Report | null>(null);
  const salesReport = ref<SalesReportResponse | null>(null);
  const expenseReport = ref<ExpenseReportResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const reportList = computed(() => reports.value?.data || []);
  const reportDetail = computed(() => report.value);
  const salesReportData = computed(() => salesReport.value);
  const expenseReportData = computed(() => expenseReport.value);

  // Actions
  async function fetchReports(params: { report_type?: string; page?: number; per_page?: number } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ReportPaginatedResponse>('/api/reports', { params });
      reports.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch reports.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchReport(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<Report>(`/api/reports/${id}`);
      report.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch report.';
    } finally {
      loading.value = false;
    }
  }

  async function generateReport(payload: ReportGenerateRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<ReportCreateResponse>('/api/reports/generate', payload);
      report.value = response.data.report;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to generate report.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteReport(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.delete<ReportDeleteResponse>(`/api/reports/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete report.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSalesReport(params: { start_date: string; end_date: string }) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<SalesReportResponse>('/api/reports/sales', { params });
      salesReport.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch sales report.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchExpenseReport(params: { start_date: string; end_date: string }) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ExpenseReportResponse>('/api/reports/expenses', { params });
      expenseReport.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch expense report.';
    } finally {
      loading.value = false;
    }
  }

  return {
    reports,
    report,
    salesReport,
    expenseReport,
    loading,
    error,
    reportList,
    reportDetail,
    salesReportData,
    expenseReportData,
    fetchReports,
    fetchReport,
    generateReport,
    deleteReport,
    fetchSalesReport,
    fetchExpenseReport,
  };
});

