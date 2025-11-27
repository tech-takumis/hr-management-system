import {defineStore} from 'pinia'
import {ref,computed} from 'vue'
import axios from '@/lib/axios.ts'
import {AxiosError} from 'axios'


// Dashboard response interfaces
export interface DashboardSummary {
  total_sales: number;
  total_transactions: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
}

export interface DashboardProducts {
  total_active: number;
  low_stock_count: number;
}

export interface TopProduct {
  id: number;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface SalesTrend {
  date: string;
  total: number;
  count: number;
}

export interface RecentSaleItemProduct {
  id: number;
  name: string;
}

export interface RecentSaleItem {
  id: number;
  product: RecentSaleItemProduct;
  quantity: number;
  subtotal: number;
}

export interface RecentSaleCustomer {
  id: number;
  name: string;
}

export interface RecentSale {
  id: number;
  sale_date: string;
  total_amount: number;
  total_profit: number;
  customer: RecentSaleCustomer;
  items: RecentSaleItem[];
}

export interface DashboardResponse {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  summary: DashboardSummary;
  products: DashboardProducts;
  top_products: TopProduct[];
  sales_trend: SalesTrend[];
  recent_sales: RecentSale[];
}

// Profit-Loss response interfaces
export interface ExpenseBreakdown {
  category: string;
  total: number;
}

export interface OperatingExpenses {
  breakdown: ExpenseBreakdown[];
  total: number;
}

export interface ProfitLossRevenue {
  total_sales: number;
  number_of_transactions: number;
}

export interface ProfitLossPeriod {
  start_date: string;
  end_date: string;
}

export interface ProfitLossResponse {
  period: ProfitLossPeriod;
  revenue: ProfitLossRevenue;
  cost_of_goods_sold: number;
  gross_profit: number;
  gross_profit_margin: number;
  operating_expenses: OperatingExpenses;
  net_profit: number;
  net_profit_margin: number;
}

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const dashboard = ref<DashboardResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const profitLoss = ref<ProfitLossResponse | null>(null);
  const profitLossLoading = ref(false);
  const profitLossError = ref<string | null>(null);

  // Getter
  const summary = computed(() => dashboard.value?.summary || null);
  const topProducts = computed(() => dashboard.value?.top_products || []);
  const profitLossSummary = computed(() => profitLoss.value || null);

  // Action
  async function fetchDashboard(period: string = 'today') {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<DashboardResponse>(`/api/dashboard`, {
        params: { period }
      });
      dashboard.value = response.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        error.value = err.response.data?.message || 'Failed to fetch dashboard data.';
      } else {
        error.value = 'Network error.';
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfitLoss(params: { start_date: string; end_date: string }) {
    profitLossLoading.value = true;
    profitLossError.value = null;
    try {
      const response = await axios.get<ProfitLossResponse>(`/api/dashboard/profit-loss`, {
        params,
      });
      profitLoss.value = response.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        profitLossError.value = err.response.data?.message || 'Failed to fetch profit-loss data.';
      } else {
        profitLossError.value = 'Network error.';
      }
    } finally {
      profitLossLoading.value = false;
    }
  }

  return {
    dashboard,
    loading,
    error,
    summary,
    topProducts,
    fetchDashboard,
    profitLoss,
    profitLossLoading,
    profitLossError,
    profitLossSummary,
    fetchProfitLoss,
  };
});
