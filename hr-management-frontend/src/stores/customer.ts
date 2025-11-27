import {defineStore} from 'pinia'
import {ref,computed} from 'vue'
import axios from '@/lib/axios.ts'


// Customer interfaces
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customer_type: 'regular' | 'wholesale' | 'retail';
  created_at: string;
  updated_at: string;
  sales?: any[]; // Adjust type if sales structure is known
}

export interface CustomerPaginatedResponse {
  data: Customer[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customer_type: 'regular' | 'wholesale' | 'retail';
}

export interface CustomerCreateUpdateResponse {
  message: string;
  customer: Customer;
}

export interface CustomerDeleteResponse {
  message: string;
}

export const useCustomerStore = defineStore('customer', () => {
  // State
  const customers = ref<CustomerPaginatedResponse | null>(null);
  const customer = ref<Customer | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const customerList = computed(() => customers.value?.data || []);
  const customerDetail = computed(() => customer.value);

  // Actions
  async function fetchCustomers(params: { search?: string; customer_type?: string; page?: number; per_page?: number } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<CustomerPaginatedResponse>('/api/customers', { params });
      customers.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch customers.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchCustomer(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<Customer>(`/api/customers/${id}`);
      customer.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch customer.';
    } finally {
      loading.value = false;
    }
  }

  async function createCustomer(payload: CustomerRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<CustomerCreateUpdateResponse>('/api/customers', payload);
      customer.value = response.data.customer;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create customer.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCustomer(id: number, payload: Partial<CustomerRequest>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put<CustomerCreateUpdateResponse>(`/api/customers/${id}`, payload);
      customer.value = response.data.customer;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update customer.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCustomer(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.delete<CustomerDeleteResponse>(`/api/customers/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete customer.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    customers,
    customer,
    loading,
    error,
    customerList,
    customerDetail,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
});
