import {defineStore} from 'pinia'
import {ref, computed } from 'vue'
import axios from '@/lib/axios.ts'

// Product interfaces
export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPaginatedResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductRequest {
  name: string;
  sku: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  category?: string;
  is_active?: boolean;
}

export interface ProductCreateUpdateResponse {
  message: string;
  product: Product;
}

export interface ProductDeleteResponse {
  message: string;
}

export type ProductCategoriesResponse = string[];

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<ProductPaginatedResponse | null>(null);
  const product = ref<Product | null>(null);
  const categories = ref<ProductCategoriesResponse>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const productList = computed(() => products.value?.data || []);
  const productDetail = computed(() => product.value);
  const categoryList = computed(() => categories.value);

  // Actions
  async function fetchProducts(params: { search?: string; category?: string; is_active?: boolean; low_stock?: boolean; page?: number; per_page?: number } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ProductPaginatedResponse>('/products', { params });
      products.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<Product>(`/api/products/${id}`);
      product.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch product.';
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(payload: ProductRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post<ProductCreateUpdateResponse>('/api/products', payload);
      product.value = response.data.product;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create product.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id: number, payload: Partial<ProductRequest>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.put<ProductCreateUpdateResponse>(`/api/products/${id}`, payload);
      product.value = response.data.product;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update product.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.delete<ProductDeleteResponse>(`/api/products/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete product.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get<ProductCategoriesResponse>('/api/products/categories');
      categories.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories.';
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    product,
    categories,
    loading,
    error,
    productList,
    productDetail,
    categoryList,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
  };
});
