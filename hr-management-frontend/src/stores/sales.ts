import {defineStore} from 'pinia'
import {ref,computed} from 'vue'
import axios from '@/lib/axios.ts'


// Sales interfaces
export interface SaleCustomer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface SaleUser {
  id: number;
  name: string;
}

export interface SaleProduct {
  id: number;
  name: string;
  sku: string;
}

export interface SaleItem {
  id: number;
  product: SaleProduct;
  product_id: number;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  sale_number: string;
  customer: SaleCustomer | null;
  user: SaleUser;
  sale_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  payment_status: 'paid' | 'pending' | 'partial';
  notes?: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface SalePaginatedResponse {
  data: Sale[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SaleItemRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount?: number;
}

export interface SaleRequest {
  customer_id?: number;
  sale_date: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  payment_status: 'paid' | 'pending' | 'partial';
  tax?: number;
  discount?: number;
  notes?: string;
  items: SaleItemRequest[];
}

export interface SaleCreateUpdateResponse {
  message: string;
  sale: Sale;
}

export interface SaleDeleteResponse {
  message: string;
}

export interface SalesSummaryResponse {
  total_sales: number;
  total_transactions: number;
  average_transaction: number;
  total_tax: number;
  total_discount: number;
}

export const useSalesStore = defineStore('sales', () => {
  // State
  const sales = ref<SalePaginatedResponse | null>(null);
  const sale = ref<Sale | null>(null);
  const summary = ref<SalesSummaryResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const salesList = computed(() => sales.value?.data || []);
  const saleDetail = computed(() => sale.value);
  const summaryStats = computed(() => summary.value);

  // Actions
  async function fetchSales(params: { search?: string; start_date?: string; end_date?: string; payment_status?: string; payment_method?: string; page?: number; per_page?: number } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<SalePaginatedResponse>('/api/sales', { params });
      sales.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch sales.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSale(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<Sale>(`/api/sales/${id}`);
      sale.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch sale.';
    } finally {
      loading.value = false;
    }
  }

  async function createSale(payload: SaleRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<SaleCreateUpdateResponse>('/api/sales', payload);
      sale.value = response.data.sale;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create sale.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSale(id: number, payload: Partial<{ payment_status: 'paid' | 'pending' | 'partial'; notes?: string }>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put<SaleCreateUpdateResponse>(`/api/sales/${id}`, payload);
      sale.value = response.data.sale;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update sale.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSale(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.delete<SaleDeleteResponse>(`/api/sales/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete sale.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSalesSummary(params: { start_date?: string; end_date?: string } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<SalesSummaryResponse>('/api/sales/summary', { params });
      summary.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch sales summary.';
    } finally {
      loading.value = false;
    }
  }

  return {
    sales,
    sale,
    summary,
    loading,
    error,
    salesList,
    saleDetail,
    summaryStats,
    fetchSales,
    fetchSale,
    createSale,
    updateSale,
    deleteSale,
    fetchSalesSummary,
  };
});
