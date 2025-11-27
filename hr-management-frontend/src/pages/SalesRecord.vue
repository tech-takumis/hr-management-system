<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { useProductStore } from '@/stores/product'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const salesStore = useSalesStore()
const productStore = useProductStore()

// State
const showFilters = ref(false)
const showAddModal = ref(false)
const selectedSales = ref<number[]>([])
const submitting = ref(false)

// Filter state
const filters = ref({
    search: '',
    payment_method: '',
    payment_status: '',
    sale_date: '',
    start_date: '',
    end_date: ''
})

// New sale form state
const newSaleForm = ref({
    customer_name: '',
    sale_date: new Date().toISOString().split('T')[0] || '',
    payment_method: 'cash' as 'cash' | 'card' | 'transfer' | 'credit',
    payment_status: 'paid' as 'paid' | 'pending' | 'partial',
    notes: '',
    items: [
        {
            product_id: null as number | null,
            product_name: "",
            quantity: 1,
            unit_price: 0
        }
    ]
})

const formErrors = ref<string[]>([])

// Pagination
const currentPage = ref(1)
const perPage = ref(15)

// Fetch sales and products on mount
onMounted(async () => {
    await fetchSalesData()
    await productStore.fetchProducts({ is_active: true, per_page: 1000 })
})

// Watch for filter changes
watch([filters, currentPage], async () => {
    await fetchSalesData()
}, { deep: true })

// Fetch sales data
const fetchSalesData = async () => {
    const params: any = {
        page: currentPage.value,
        per_page: perPage.value
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.payment_method) params.payment_method = filters.value.payment_method
    if (filters.value.payment_status) params.payment_status = filters.value.payment_status
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date

    await salesStore.fetchSales(params)
}

// Computed
const salesList = computed(() => salesStore.salesList)
const loading = computed(() => salesStore.loading)
const totalPages = computed(() => salesStore.sales?.last_page || 1)
const totalSales = computed(() => salesStore.sales?.total || 0)
const productList = computed(() => productStore.productList)

// Bulk selection
const allSelected = computed({
    get: () => salesList.value.length > 0 && selectedSales.value.length === salesList.value.length,
    set: (value: boolean) => {
        if (value) {
            selectedSales.value = salesList.value.map(sale => sale.id)
        } else {
            selectedSales.value = []
        }
    }
})

const someSelected = computed(() =>
    selectedSales.value.length > 0 && selectedSales.value.length < salesList.value.length
)

// Toggle filter visibility
const toggleFilters = () => {
    showFilters.value = !showFilters.value
}

// Clear filters
const clearFilters = () => {
    filters.value = {
        search: '',
        payment_method: '',
        payment_status: '',
        sale_date: '',
        start_date: '',
        end_date: ''
    }
    currentPage.value = 1
}

// Toggle single selection
const toggleSelection = (saleId: number) => {
    const index = selectedSales.value.indexOf(saleId)
    if (index > -1) {
        selectedSales.value.splice(index, 1)
    } else {
        selectedSales.value.push(saleId)
    }
}

// Bulk delete
const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedSales.value.length} sale(s)?`)) {
        return
    }

    try {
        // Delete each selected sale
        for (const saleId of selectedSales.value) {
            await salesStore.deleteSale(saleId)
        }

        // Clear selection and refresh
        selectedSales.value = []
        await fetchSalesData()

        alert('Sales deleted successfully!')
    } catch (error) {
        alert('Failed to delete some sales. Please try again.')
    }
}

// Delete single sale
const deleteSale = async (saleId: number) => {
    if (!confirm('Are you sure you want to delete this sale?')) {
        return
    }

    try {
        await salesStore.deleteSale(saleId)
        await fetchSalesData()
        alert('Sale deleted successfully!')
    } catch (error) {
        alert('Failed to delete sale. Please try again.')
    }
}

// Pagination
const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

// Modal functions
const openAddModal = () => {
    showAddModal.value = true
    resetForm()
}

const closeAddModal = () => {
    showAddModal.value = false
    formErrors.value = []
}

const resetForm = () => {
    newSaleForm.value = {
        customer_name: '',
        sale_date: new Date().toISOString().split('T')[0] || '',
        payment_method: 'cash',
        payment_status: 'paid',
        notes: '',
        items: [
            {
                product_id: null,
                product_name: "",
                quantity: 1,
                unit_price: 0
            }
        ]
    }
    formErrors.value = []
}

// Sale items management
const addItem = () => {
    newSaleForm.value.items.push({
        product_id: null,
        product_name: "",
        quantity: 1,
        unit_price: 0
    })
}

// Handle product selection - auto-fill price
const onProductSelect = (item: any) => {
    const selectedProduct = productList.value.find(p => p.id === item.product_id)
    if (selectedProduct) {
        item.unit_price = selectedProduct.selling_price
        item.product_name = selectedProduct.name
    }
}

const removeItem = (index: number) => {
    if (newSaleForm.value.items.length > 1) {
        newSaleForm.value.items.splice(index, 1)
    }
}

// Calculate totals
const calculateSubtotal = (item: any) => {
    return item.quantity * item.unit_price
}

const totalAmount = computed(() => {
    return newSaleForm.value.items.reduce((sum, item) => sum + calculateSubtotal(item), 0)
})

// Submit new sale
const submitNewSale = async () => {
    formErrors.value = []

    // Validation
    if (!newSaleForm.value.sale_date) {
        formErrors.value.push('Sale date is required')
    }

    if (newSaleForm.value.items.length === 0) {
        formErrors.value.push('At least one item is required')
    }

    for (let i = 0; i < newSaleForm.value.items.length; i++) {
        const item = newSaleForm.value.items[i]
        if (!item?.product_id) {
            formErrors.value.push(`Item ${i + 1}: Product is required`)
        }
        if (!item?.quantity || item?.quantity <= 0) {
            formErrors.value.push(`Item ${i + 1}: Quantity must be greater than 0`)
        }
        if (!item?.unit_price || item?.unit_price <= 0) {
            formErrors.value.push(`Item ${i + 1}: Unit price must be greater than 0`)
        }
    }

    if (formErrors.value.length > 0) {
        return
    }

    submitting.value = true

    try {
        await salesStore.createSale(newSaleForm.value)
        closeAddModal()
        await fetchSalesData()
        alert('Sale created successfully!')
    } catch (error: any) {
        if (error.response?.data?.errors) {
            formErrors.value = Object.values(error.response.data.errors).flat() as string[]
        } else {
            formErrors.value = ['Failed to create sale. Please try again.']
        }
    } finally {
        submitting.value = false
    }
}

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)
}

// Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>

<template>
    <AuthenticatedLayout>
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">Sales Record</h2>
                    <p class="text-gray-600 mt-1">Manage and view all sales transactions</p>
                </div>
                <div class="flex items-center gap-3">
                    <!-- Bulk Delete Button (shown when items selected) -->
                    <button
                        v-if="selectedSales.length > 0"
                        class="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                        @click="bulkDelete">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete {{ selectedSales.length }} selected
                    </button>

                    <!-- Add New Sale Button -->
                    <button
                        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        @click="openAddModal">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Sale
                    </button>

                    <!-- Filter Button -->
                    <button
                        class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        :class="{ 'bg-indigo-50 border-indigo-500 text-indigo-700': showFilters }"
                        @click="toggleFilters">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>
                </div>
            </div>
        </div>

        <!-- Filter Card (Collapsible) -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <div v-if="showFilters" class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Filter Sales</h3>
                    <button
                        class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        @click="clearFilters">
                        Clear All
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <!-- Customer Name Search -->
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Customer Name
                        </label>
                        <input
                            v-model="filters.search"
                            type="text"
                            placeholder="Search by customer..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>

                    <!-- Payment Method -->
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <select
                            v-model="filters.payment_method"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">All Methods</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="transfer">Transfer</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>

                    <!-- Payment Status -->
                    <div class="lg:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Payment Status
                        </label>
                        <select
                            v-model="filters.payment_status"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                        </select>
                    </div>

                    <!-- Date Range - Start Date -->
                    <div class="lg:col-span-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            v-model="filters.start_date"
                            type="date"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>

                    <!-- Date Range - End Date -->
                    <div class="lg:col-span-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            v-model="filters.end_date"
                            type="date"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Sales Table -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Table Header Info -->
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-600">
                        Showing {{ salesList.length }} of {{ totalSales }} sales
                        <span v-if="selectedSales.length > 0" class="ml-2 text-indigo-600 font-medium">
                            ({{ selectedSales.length }} selected)
                        </span>
                    </p>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="salesList.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="mt-4 text-gray-600">No sales found</p>
                <button
                    v-if="filters.search || filters.payment_method || filters.payment_status"
                    class="mt-2 text-indigo-600 hover:text-indigo-700"
                    @click="clearFilters">
                    Clear filters
                </button>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <!-- Bulk Select Checkbox -->
                            <th class="px-6 py-3 text-left">
                                <input
                                    v-model="allSelected"
                                    type="checkbox"
                                    :indeterminate="someSelected"
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer">
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Sale #
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Customer
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Date
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Amount
                            </th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Payment
                            </th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Items
                            </th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr
                            v-for="sale in salesList"
                            :key="sale.id"
                            class="hover:bg-gray-50 transition-colors"
                            :class="{ 'bg-indigo-50': selectedSales.includes(sale.id) }">
                            <!-- Checkbox -->
                            <td class="px-6 py-4">
                                <input
                                    :checked="selectedSales.includes(sale.id)"
                                    type="checkbox"
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                    @change="toggleSelection(sale.id)">
                            </td>
                            <!-- Sale Number -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-800">{{ sale.sale_number }}</div>
                            </td>
                            <!-- Customer -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-800">{{ sale.customer_name || 'Walk-in' }}</div>
                                <div class="text-xs text-gray-500">By: {{ sale.user.name }}</div>
                            </td>
                            <!-- Date -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-800">{{ formatDate(sale.sale_date) }}</div>
                            </td>
                            <!-- Amount -->
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <div class="text-sm font-semibold text-indigo-600">{{ formatCurrency(sale.total_amount) }}</div>
                            </td>
                            <!-- Payment Method -->
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="capitalize text-sm text-gray-600">{{ sale.payment_method }}</span>
                            </td>
                            <!-- Payment Status -->
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span
                                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize"
                                    :class="{
                                        'bg-green-100 text-green-800': sale.payment_status === 'paid',
                                        'bg-yellow-100 text-yellow-800': sale.payment_status === 'pending',
                                        'bg-blue-100 text-blue-800': sale.payment_status === 'partial'
                                    }">
                                    {{ sale.payment_status }}
                                </span>
                            </td>
                            <!-- Items Count -->
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="text-sm text-gray-600">{{ sale.items?.length || 0 }} items</span>
                            </td>
                            <!-- Actions -->
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                    class="text-rose-600 hover:text-rose-800 transition-colors"
                                    @click="deleteSale(sale.id)">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                        Page {{ currentPage }} of {{ totalPages }}
                    </div>
                    <div class="flex gap-2">
                        <button
                            :disabled="currentPage === 1"
                            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            @click="goToPage(currentPage - 1)">
                            Previous
                        </button>
                        <button
                            v-for="page in Math.min(5, totalPages)"
                            :key="page"
                            class="px-3 py-1 border rounded-lg transition-colors"
                            :class="page === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-100'"
                            @click="goToPage(page)">
                            {{ page }}
                        </button>
                        <button
                            :disabled="currentPage === totalPages"
                            class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            @click="goToPage(currentPage + 1)">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add New Sale Modal (Slide-in from Right) -->
        <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full">
            <div
                v-if="showAddModal"
                class="fixed inset-y-0 right-0 z-50 w-full sm:w-5/12 bg-white shadow-2xl overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h3 class="text-lg font-semibold text-gray-800">Add New Sale</h3>
                    <button
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        @click="closeAddModal">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- Error Messages -->
                    <div v-if="formErrors.length > 0" class="bg-rose-50 border border-rose-200 rounded-lg p-4">
                        <div class="flex items-start gap-2">
                            <svg class="w-5 h-5 text-rose-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div class="flex-1">
                                <h4 class="text-sm font-semibold text-rose-800 mb-1">Please fix the following errors:</h4>
                                <ul class="text-sm text-rose-700 list-disc list-inside space-y-1">
                                    <li v-for="(error, index) in formErrors" :key="index">{{ error }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Information -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 mb-4">Customer Information</h4>
                        <div class="space-y-4">
                            <!-- Customer Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name <span class="text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    v-model="newSaleForm.customer_name"
                                    type="text"
                                    placeholder="Walk-in customer"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>

                            <!-- Sale Date -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Sale Date <span class="text-rose-600">*</span>
                                </label>
                                <input
                                    v-model="newSaleForm.sale_date"
                                    type="date"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                    </div>

                    <!-- Sale Items -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-sm font-semibold text-gray-700">Sale Items <span class="text-rose-600">*</span></h4>
                            <button
                                type="button"
                                class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                @click="addItem">
                                + Add Item
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div
                                v-for="(item, index) in newSaleForm.items"
                                :key="index"
                                class="border border-gray-200 rounded-lg p-4 relative">
                                <!-- Remove Button -->
                                <button
                                    v-if="newSaleForm.items.length > 1"
                                    type="button"
                                    class="absolute top-2 right-2 text-rose-600 hover:text-rose-800"
                                    @click="removeItem(index)">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div class="space-y-3">
                                    <!-- Product Select -->
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700 mb-1">
                                            Product <span class="text-rose-600">*</span>
                                        </label>
                                        <select
                                            v-model.number="item.product_id"
                                            @change="onProductSelect(item)"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                                            <option :value="null" disabled>Select a product</option>
                                            <option
                                                v-for="product in productList"
                                                :key="product.id"
                                                :value="product.id">
                                                {{ product.name }} - {{ formatCurrency(product.selling_price) }} (Stock: {{ product.stock_quantity }})
                                            </option>
                                        </select>
                                    </div>

                                    <!-- Quantity and Unit Price -->
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-700 mb-1">
                                                Quantity <span class="text-rose-600">*</span>
                                            </label>
                                            <input
                                                v-model.number="item.quantity"
                                                type="number"
                                                min="1"
                                                step="1"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-700 mb-1">
                                                Unit Price <span class="text-rose-600">*</span>
                                            </label>
                                            <input
                                                v-model.number="item.unit_price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                                        </div>
                                    </div>

                                    <!-- Item Subtotal -->
                                    <div class="pt-2 border-t border-gray-200">
                                        <div class="flex justify-between items-center">
                                            <span class="text-xs font-medium text-gray-600">Item Subtotal:</span>
                                            <span class="text-sm font-semibold text-indigo-600">
                                                {{ formatCurrency(calculateSubtotal(item)) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Details -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 mb-4">Payment Details</h4>
                        <div class="space-y-4">
                            <!-- Payment Method -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method <span class="text-rose-600">*</span>
                                </label>
                                <select
                                    v-model="newSaleForm.payment_method"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="credit">Credit</option>
                                </select>
                            </div>

                            <!-- Payment Status -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Status <span class="text-rose-600">*</span>
                                </label>
                                <select
                                    v-model="newSaleForm.payment_status"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            v-model="newSaleForm.notes"
                            rows="3"
                            placeholder="Add any additional notes..."
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"></textarea>
                    </div>

                    <!-- Total Summary -->
                    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="text-base font-semibold text-gray-800">Total Amount:</span>
                            <span class="text-xl font-bold text-indigo-600">{{ formatCurrency(totalAmount) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
                    <button
                        type="button"
                        class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        @click="closeAddModal">
                        Cancel
                    </button>
                    <button
                        type="button"
                        :disabled="submitting"
                        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="submitNewSale">
                        <span v-if="submitting">Creating...</span>
                        <span v-else>Create Sale</span>
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Backdrop Overlay -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div
                v-if="showAddModal"
                class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
                @click="closeAddModal"></div>
        </Transition>
    </AuthenticatedLayout>
</template>

<style scoped>
/* Indeterminate checkbox state */
input[type="checkbox"]:indeterminate {
    background-color: #4f46e5;
    border-color: #4f46e5;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
}
</style>
