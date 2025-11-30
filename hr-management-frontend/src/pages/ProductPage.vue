<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useProductStore } from '@/stores/product'
import type { Product, ProductRequest } from '@/stores/product'
import {
    FunnelIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const productStore = useProductStore()

// UI State
const showFilters = ref(false)
const showCreateModal = ref(false)
const selectedProducts = ref<number[]>([])

// Filter State
const filters = ref({
    search: '',
    category: '',
    is_active: undefined as boolean | undefined,
    low_stock: false,
})

// Pagination State
const currentPage = ref(1)
const perPage = ref(10)

// Create Product Form
const createForm = ref<ProductRequest>({
    name: '',
    sku: '',
    description: '',
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    unit: '',
    category: '',
    is_active: true,
})

const formErrors = ref<string[]>([])
const processing = ref(false)

// Computed
const products = computed(() => productStore.productList)
const loading = computed(() => productStore.loading)
const categories = computed(() => productStore.categoryList)
const allSelected = computed({
    get: () =>
        products.value.length > 0 &&
        selectedProducts.value.length === products.value.length,
    set: (value: boolean) => {
        if (value) {
            selectedProducts.value = products.value.map((p) => p.id)
        } else {
            selectedProducts.value = []
        }
    },
})

// Methods
const fetchProducts = async () => {
    const params: any = {
        page: currentPage.value,
        per_page: perPage.value,
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.category) params.category = filters.value.category
    if (filters.value.is_active !== undefined)
        params.is_active = filters.value.is_active
    if (filters.value.low_stock) params.low_stock = filters.value.low_stock

    await productStore.fetchProducts(params)
}

const fetchCategories = async () => {
    await productStore.fetchCategories()
}

const applyFilters = async () => {
    currentPage.value = 1
    await fetchProducts()
}

const clearFilters = () => {
    filters.value = {
        search: '',
        category: '',
        is_active: undefined,
        low_stock: false,
    }
    applyFilters()
}

const toggleProductSelection = (productId: number) => {
    const index = selectedProducts.value.indexOf(productId)
    if (index > -1) {
        selectedProducts.value.splice(index, 1)
    } else {
        selectedProducts.value.push(productId)
    }
}

const bulkDelete = async () => {
    if (selectedProducts.value.length === 0) return

    const confirmDelete = confirm(
        `Are you sure you want to delete ${selectedProducts.value.length} product(s)?`,
    )
    if (!confirmDelete) return

    try {
        for (const productId of selectedProducts.value) {
            await productStore.deleteProduct(productId)
        }
        selectedProducts.value = []
        await fetchProducts()
    } catch (error) {
        console.error('Bulk delete failed:', error)
    }
}

const openCreateModal = () => {
    resetCreateForm()
    showCreateModal.value = true
}

const closeCreateModal = () => {
    showCreateModal.value = false
    resetCreateForm()
}

const resetCreateForm = () => {
    createForm.value = {
        name: '',
        sku: '',
        description: '',
        cost_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        unit: '',
        category: '',
        is_active: true,
    }
    formErrors.value = []
}

const createProduct = async () => {
    processing.value = true
    formErrors.value = []

    try {
        await productStore.createProduct(createForm.value)
        closeCreateModal()
        await fetchProducts()
    } catch (error: any) {
        if (error.response?.status === 422) {
            formErrors.value = Object.values(error.response.data.errors).flat() as string[]
        } else {
            formErrors.value = [productStore.error || 'Failed to create product']
        }
    } finally {
        processing.value = false
    }
}

const navigateToDetail = (productId: number) => {
    router.push({ name: 'product-detail', params: { id: productId } })
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}

const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600' }
    if (quantity < 10) return { text: 'Low Stock', color: 'text-yellow-600' }
    return { text: 'In Stock', color: 'text-green-600' }
}

// Lifecycle
onMounted(async () => {
    await Promise.all([fetchProducts(), fetchCategories()])
})
</script>

<template>
    <AuthenticatedLayout>
        <div class="py-4">
            <!-- Header -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">
                            Products
                        </h1>
                        <p class="mt-1 text-sm text-gray-600">
                            Manage your product inventory
                        </p>
                    </div>
                    <div class="flex space-x-3">
                        <button
                            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            @click="showFilters = !showFilters"
                        >
                            <FunnelIcon class="h-5 w-5 mr-2" />
                            Filters
                        </button>
                        <button
                            v-if="selectedProducts.length > 0"
                            class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            @click="bulkDelete"
                        >
                            <TrashIcon class="h-5 w-5 mr-2" />
                            Delete Selected ({{ selectedProducts.length }})
                        </button>
                        <button
                            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            @click="openCreateModal"
                        >
                            <PlusIcon class="h-5 w-5 mr-2" />
                            Create Product
                        </button>
                    </div>
                </div>

                <!-- Filters Card -->
                <div
                    v-if="showFilters"
                    class="bg-white rounded-lg shadow-md p-6 mb-6"
                >
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                v-model="filters.search"
                                type="text"
                                placeholder="Search by name or SKU..."
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                v-model="filters.category"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All Categories</option>
                                <option
                                    v-for="category in categories"
                                    :key="category"
                                    :value="category"
                                >
                                    {{ category }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                v-model="filters.is_active"
                                class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option :value="undefined">All Status</option>
                                <option :value="true">Active</option>
                                <option :value="false">Inactive</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <label class="flex items-center">
                                <input
                                    v-model="filters.low_stock"
                                    type="checkbox"
                                    class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span class="ml-2 text-sm text-gray-700">
                                    Low Stock Only
                                </span>
                            </label>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end space-x-3">
                        <button
                            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            @click="clearFilters"
                        >
                            Clear
                        </button>
                        <button
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            @click="applyFilters"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="bg-white shadow-md rounded-lg overflow-hidden">
                    <div v-if="loading" class="p-8 text-center">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p class="mt-2 text-gray-600">Loading products...</p>
                    </div>

                    <div v-else-if="products.length === 0" class="p-8 text-center">
                        <p class="text-gray-600">No products found.</p>
                    </div>

                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left">
                                        <input
                                            v-model="allSelected"
                                            type="checkbox"
                                            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SKU
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cost Price
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Selling Price
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr
                                    v-for="product in products"
                                    :key="product.id"
                                    class="hover:bg-gray-50 cursor-pointer transition-colors"
                                    @click="navigateToDetail(product.id)"
                                >
                                    <td
                                        class="px-6 py-4 whitespace-nowrap"
                                        @click.stop
                                    >
                                        <input
                                            :checked="selectedProducts.includes(product.id)"
                                            type="checkbox"
                                            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            @change="toggleProductSelection(product.id)"
                                        />
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {{ product.sku }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm font-medium text-gray-900">
                                            {{ product.name }}
                                        </div>
                                        <div v-if="product.description" class="text-sm text-gray-500 truncate max-w-xs">
                                            {{ product.description }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span
                                            v-if="product.category"
                                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                                        >
                                            {{ product.category }}
                                        </span>
                                        <span v-else class="text-gray-400">-</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {{ formatCurrency(product.cost_price) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {{ formatCurrency(product.selling_price) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900">
                                            {{ product.stock_quantity }} {{ product.unit }}
                                        </div>
                                        <div
                                            class="text-xs font-medium"
                                            :class="getStockStatus(product.stock_quantity).color"
                                        >
                                            {{ getStockStatus(product.stock_quantity).text }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                            :class="
                                                product.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            "
                                        >
                                            {{ product.is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div
                        v-if="productStore.products && productStore.products.total > perPage"
                        class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex-1 flex justify-between sm:hidden">
                                <button
                                    :disabled="currentPage === 1"
                                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    @click="currentPage--; fetchProducts()"
                                >
                                    Previous
                                </button>
                                <button
                                    :disabled="currentPage === productStore.products.last_page"
                                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    @click="currentPage++; fetchProducts()"
                                >
                                    Next
                                </button>
                            </div>
                            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p class="text-sm text-gray-700">
                                        Showing
                                        <span class="font-medium">{{ (currentPage - 1) * perPage + 1 }}</span>
                                        to
                                        <span class="font-medium">{{
                                            Math.min(currentPage * perPage, productStore.products.total)
                                        }}</span>
                                        of
                                        <span class="font-medium">{{ productStore.products.total }}</span>
                                        results
                                    </p>
                                </div>
                                <div>
                                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            :disabled="currentPage === 1"
                                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            @click="currentPage--; fetchProducts()"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            :disabled="currentPage === productStore.products.last_page"
                                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            @click="currentPage++; fetchProducts()"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create Product Modal -->
        <div
            v-if="showCreateModal"
            class="fixed z-10 inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div class="flex items-stretch justify-end min-h-screen">
                <div
                    class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    @click="closeCreateModal"
                ></div>

                <div class="relative bg-white w-5/12 shadow-xl overflow-y-auto">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 id="modal-title" class="text-lg font-medium text-gray-900">
                                Create New Product
                            </h3>
                            <button
                                class="text-gray-400 hover:text-gray-500"
                                @click="closeCreateModal"
                            >
                                <XMarkIcon class="h-6 w-6" />
                            </button>
                        </div>

                        <!-- Error Messages -->
                        <div
                            v-if="formErrors.length > 0"
                            class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
                        >
                            <ul class="list-disc list-inside">
                                <li v-for="error in formErrors" :key="error">
                                    {{ error }}
                                </li>
                            </ul>
                        </div>

                        <form class="space-y-4" @submit.prevent="createProduct">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Product Name *
                                    </label>
                                    <input
                                        v-model="createForm.name"
                                        type="text"
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        SKU *
                                    </label>
                                    <input
                                        v-model="createForm.sku"
                                        type="text"
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        v-model="createForm.description"
                                        rows="3"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    ></textarea>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Cost Price *
                                    </label>
                                    <input
                                        v-model.number="createForm.cost_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Selling Price *
                                    </label>
                                    <input
                                        v-model.number="createForm.selling_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Stock Quantity *
                                    </label>
                                    <input
                                        v-model.number="createForm.stock_quantity"
                                        type="number"
                                        min="0"
                                        required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Unit *
                                    </label>
                                    <input
                                        v-model="createForm.unit"
                                        type="text"
                                        required
                                        placeholder="e.g., pcs, kg, liter"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Category
                                    </label>
                                    <input
                                        v-model="createForm.category"
                                        type="text"
                                        list="categories"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    <datalist id="categories">
                                        <option
                                            v-for="category in categories"
                                            :key="category"
                                            :value="category"
                                        />
                                    </datalist>
                                </div>

                                <div class="md:col-span-2">
                                    <label class="flex items-center">
                                        <input
                                            v-model="createForm.is_active"
                                            type="checkbox"
                                            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <span class="ml-2 text-sm text-gray-700">
                                            Active
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="submit"
                                    :disabled="processing"
                                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                >
                                    {{ processing ? 'Creating...' : 'Create Product' }}
                                </button>
                                <button
                                    type="button"
                                    :disabled="processing"
                                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    @click="closeCreateModal"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
/* Add any additional custom styles here */
</style>
