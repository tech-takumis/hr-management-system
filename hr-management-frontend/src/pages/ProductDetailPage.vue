<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useProductStore } from '@/stores/product'
import type { ProductRequest } from '@/stores/product'
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

// State
const showEditModal = ref(false)
const editForm = ref<ProductRequest>({
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
const product = computed(() => productStore.productDetail)
const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const categories = computed(() => productStore.categoryList)

const profitMargin = computed(() => {
    if (!product.value) return 0
    const profit = product.value.selling_price - product.value.cost_price
    return product.value.cost_price > 0
        ? (profit / product.value.cost_price) * 100
        : 0
})

const stockValue = computed(() => {
    if (!product.value) return 0
    return product.value.stock_quantity * product.value.cost_price
})

const potentialRevenue = computed(() => {
    if (!product.value) return 0
    return product.value.stock_quantity * product.value.selling_price
})

const getStockStatus = computed(() => {
    if (!product.value) return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' }
    const quantity = product.value.stock_quantity

    if (quantity === 0)
        return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' }
    if (quantity < 10)
        return { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' }
})

// Methods
const fetchProduct = async () => {
    const productId = parseInt(route.params.id as string)
    if (isNaN(productId)) {
        router.push({ name: 'all-products' })
        return
    }
    await productStore.fetchProduct(productId)
}

const fetchCategories = async () => {
    await productStore.fetchCategories()
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const goBack = () => {
    router.push({ name: 'all-products' })
}

const openEditModal = () => {
    if (!product.value) return

    editForm.value = {
        name: product.value.name,
        sku: product.value.sku,
        description: product.value.description || '',
        cost_price: product.value.cost_price,
        selling_price: product.value.selling_price,
        stock_quantity: product.value.stock_quantity,
        unit: product.value.unit,
        category: product.value.category || '',
        is_active: product.value.is_active,
    }
    formErrors.value = []
    showEditModal.value = true
}

const closeEditModal = () => {
    showEditModal.value = false
    formErrors.value = []
}

const updateProduct = async () => {
    if (!product.value) return

    processing.value = true
    formErrors.value = []

    try {
        await productStore.updateProduct(product.value.id, editForm.value)
        closeEditModal()
        await fetchProduct()
    } catch (error: any) {
        if (error.response?.status === 422) {
            formErrors.value = Object.values(error.response.data.errors).flat() as string[]
        } else {
            formErrors.value = [productStore.error || 'Failed to update product']
        }
    } finally {
        processing.value = false
    }
}

const deleteProduct = async () => {
    if (!product.value) return

    const confirmDelete = confirm(
        `Are you sure you want to delete "${product.value.name}"? This action cannot be undone.`
    )
    if (!confirmDelete) return

    try {
        await productStore.deleteProduct(product.value.id)
        await router.push({ name: 'all-products' })
    } catch (error) {
        console.log("Failed to delete product: "+error)
        alert('Failed to delete product. Please try again.')
    }
}

// Lifecycle
onMounted(async () => {
    await Promise.all([fetchProduct(), fetchCategories()])
})
</script>

<template>
    <AuthenticatedLayout>
        <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center items-center h-64">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-12">
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
                        <p class="font-medium">{{ error }}</p>
                        <button
                            class="mt-4 text-sm text-red-600 hover:text-red-800 underline"
                            @click="goBack"
                        >
                            Go back to products
                        </button>
                    </div>
                </div>

                <!-- Product Details -->
                <div v-else-if="product">
                    <!-- Header -->
                    <div class="mb-6">
                        <button
                            class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                            @click="goBack"
                        >
                            <ArrowLeftIcon class="h-4 w-4 mr-2" />
                            Back to Products
                        </button>

                        <div class="flex justify-between items-start">
                            <div>
                                <div class="flex items-center space-x-3">
                                    <h1 class="text-3xl font-bold text-gray-900">
                                        {{ product.name }}
                                    </h1>
                                    <span
                                        class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
                                        :class="
                                            product.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        "
                                    >
                                        {{ product.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>
                                <p class="mt-1 text-sm text-gray-600">
                                    SKU: <span class="font-medium text-gray-900">{{ product.sku }}</span>
                                </p>
                            </div>
                            <div class="flex space-x-3">
                                <button
                                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    @click="openEditModal"
                                >
                                    <PencilIcon class="h-5 w-5 mr-2" />
                                    Edit
                                </button>
                                <button
                                    class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    @click="deleteProduct"
                                >
                                    <TrashIcon class="h-5 w-5 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Selling Price</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-900">
                                        {{ formatCurrency(product.selling_price) }}
                                    </p>
                                </div>
                                <div class="p-3 bg-blue-100 rounded-full">
                                    <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Cost Price</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-900">
                                        {{ formatCurrency(product.cost_price) }}
                                    </p>
                                </div>
                                <div class="p-3 bg-purple-100 rounded-full">
                                    <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Stock Quantity</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-900">
                                        {{ product.stock_quantity }} {{ product.unit }}
                                    </p>
                                    <p class="mt-1 text-xs font-medium" :class="getStockStatus.color">
                                        {{ getStockStatus.text }}
                                    </p>
                                </div>
                                <div class="p-3 rounded-full" :class="getStockStatus.bg">
                                    <svg class="h-6 w-6" :class="getStockStatus.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Profit Margin</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-900">
                                        {{ profitMargin.toFixed(2) }}%
                                    </p>
                                    <p class="mt-1 text-xs text-gray-500">
                                        {{ formatCurrency(product.selling_price - product.cost_price) }} per unit
                                    </p>
                                </div>
                                <div class="p-3 bg-green-100 rounded-full">
                                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Product Information -->
                        <div class="lg:col-span-2 space-y-6">
                            <!-- Basic Information -->
                            <div class="bg-white rounded-lg shadow">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-medium text-gray-900">Product Information</h2>
                                </div>
                                <div class="px-6 py-4">
                                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Product Name</dt>
                                            <dd class="mt-1 text-sm text-gray-900">{{ product.name }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">SKU</dt>
                                            <dd class="mt-1 text-sm text-gray-900">{{ product.sku }}</dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Category</dt>
                                            <dd class="mt-1 text-sm text-gray-900">
                                                <span
                                                    v-if="product.category"
                                                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                                                >
                                                    {{ product.category }}
                                                </span>
                                                <span v-else class="text-gray-400">Not categorized</span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Unit</dt>
                                            <dd class="mt-1 text-sm text-gray-900">{{ product.unit }}</dd>
                                        </div>
                                        <div class="md:col-span-2">
                                            <dt class="text-sm font-medium text-gray-500">Description</dt>
                                            <dd class="mt-1 text-sm text-gray-900">
                                                {{ product.description || 'No description provided' }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <!-- Pricing Information -->
                            <div class="bg-white rounded-lg shadow">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-medium text-gray-900">Pricing & Financial</h2>
                                </div>
                                <div class="px-6 py-4">
                                    <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Cost Price</dt>
                                            <dd class="mt-1 text-lg font-semibold text-gray-900">
                                                {{ formatCurrency(product.cost_price) }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Selling Price</dt>
                                            <dd class="mt-1 text-lg font-semibold text-gray-900">
                                                {{ formatCurrency(product.selling_price) }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Profit per Unit</dt>
                                            <dd class="mt-1 text-lg font-semibold text-green-600">
                                                {{ formatCurrency(product.selling_price - product.cost_price) }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Profit Margin</dt>
                                            <dd class="mt-1 text-lg font-semibold text-green-600">
                                                {{ profitMargin.toFixed(2) }}%
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Stock Value (Cost)</dt>
                                            <dd class="mt-1 text-lg font-semibold text-gray-900">
                                                {{ formatCurrency(stockValue) }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Potential Revenue</dt>
                                            <dd class="mt-1 text-lg font-semibold text-gray-900">
                                                {{ formatCurrency(potentialRevenue) }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="space-y-6">
                            <!-- Stock Status -->
                            <div class="bg-white rounded-lg shadow">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-medium text-gray-900">Stock Status</h2>
                                </div>
                                <div class="px-6 py-4">
                                    <div class="flex items-center justify-center py-4">
                                        <div class="text-center">
                                            <div
                                                class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
                                                :class="getStockStatus.bg"
                                            >
                                                <CheckCircleIcon
                                                    v-if="product.stock_quantity > 10"
                                                    class="h-10 w-10"
                                                    :class="getStockStatus.color"
                                                />
                                                <XCircleIcon
                                                    v-else
                                                    class="h-10 w-10"
                                                    :class="getStockStatus.color"
                                                />
                                            </div>
                                            <p class="text-2xl font-bold text-gray-900">
                                                {{ product.stock_quantity }}
                                            </p>
                                            <p class="text-sm text-gray-500 mb-2">{{ product.unit }} available</p>
                                            <span
                                                class="px-3 py-1 text-xs font-semibold rounded-full"
                                                :class="`${getStockStatus.bg} ${getStockStatus.color}`"
                                            >
                                                {{ getStockStatus.text }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Product Status -->
                            <div class="bg-white rounded-lg shadow">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h2 class="text-lg font-medium text-gray-900">Product Status</h2>
                                </div>
                                <div class="px-6 py-4">
                                    <dl class="space-y-4">
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Status</dt>
                                            <dd class="mt-1">
                                                <span
                                                    class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
                                                    :class="
                                                        product.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    "
                                                >
                                                    {{ product.is_active ? 'Active' : 'Inactive' }}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Created At</dt>
                                            <dd class="mt-1 text-sm text-gray-900">
                                                {{ formatDate(product.created_at) }}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                                            <dd class="mt-1 text-sm text-gray-900">
                                                {{ formatDate(product.updated_at) }}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Product Modal -->
        <div
            v-if="showEditModal"
            class="fixed z-10 inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div class="flex items-stretch justify-end min-h-screen">
                <div
                    class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    @click="closeEditModal"
                ></div>

                <div class="relative bg-white w-5/12 shadow-xl overflow-y-auto">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 id="modal-title" class="text-lg font-medium text-gray-900">
                                Edit Product
                            </h3>
                            <button
                                class="text-gray-400 hover:text-gray-500"
                                @click="closeEditModal"
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

                        <form class="space-y-4" @submit.prevent="updateProduct">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Product Name *
                                    </label>
                                    <input
                                        v-model="editForm.name"
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
                                        v-model="editForm.sku"
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
                                        v-model="editForm.description"
                                        rows="3"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    ></textarea>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">
                                        Cost Price *
                                    </label>
                                    <input
                                        v-model.number="editForm.cost_price"
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
                                        v-model.number="editForm.selling_price"
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
                                        v-model.number="editForm.stock_quantity"
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
                                        v-model="editForm.unit"
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
                                        v-model="editForm.category"
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
                                            v-model="editForm.is_active"
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
                                    {{ processing ? 'Updating...' : 'Update Product' }}
                                </button>
                                <button
                                    type="button"
                                    :disabled="processing"
                                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    @click="closeEditModal"
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
