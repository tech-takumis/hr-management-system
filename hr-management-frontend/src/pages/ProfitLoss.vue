<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useExpensesStore } from '@/stores/expenses'
import { useDashboardStore } from '@/stores/dashboard'

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
)

const expensesStore = useExpensesStore()
const dashboardStore = useDashboardStore()

// Filters
const dateFrom = ref('')
const dateTo = ref('')

// Fetch data on mount
onMounted(async () => {
    setDefaultDates()
    await fetchData()
})

const setDefaultDates = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    dateTo.value = today.toISOString().split('T')[0]
    dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
}

const fetchData = async () => {
    await Promise.all([
        expensesStore.fetchExpenses({
            start_date: dateFrom.value,
            end_date: dateTo.value,
            per_page: 100
        }),
        expensesStore.fetchSummary({
            start_date: dateFrom.value,
            end_date: dateTo.value
        }),
        dashboardStore.fetchProfitLoss({
            start_date: dateFrom.value,
            end_date: dateTo.value
        })
    ])
}

const applyFilter = async () => {
    await fetchData()
}

// Computed data
const totalRevenue = computed(() => dashboardStore.profitLoss?.revenue.total_sales || 0)
const costOfGoodsSold = computed(() => dashboardStore.profitLoss?.cost_of_goods_sold || 0)
const grossProfit = computed(() => dashboardStore.profitLoss?.gross_profit || 0)
const grossProfitMargin = computed(() => (dashboardStore.profitLoss?.gross_profit_margin || 0) * 100)

const totalExpenses = computed(() => expensesStore.summaryStats?.total_expenses || 0)
const expensesByCategory = computed(() => expensesStore.summaryStats?.expenses_by_category || [])

const netProfit = computed(() => grossProfit.value - totalExpenses.value)
const netProfitMargin = computed(() => totalRevenue.value > 0 ? (netProfit.value / totalRevenue.value) * 100 : 0)

// Expense breakdown pie chart
const expenseBreakdownData = computed(() => {
    const categories = expensesByCategory.value
    if (!categories || categories.length === 0) {
        return { labels: [], datasets: [] }
    }

    return {
        labels: categories.map(c => c.category),
        datasets: [
            {
                data: categories.map(c => c.total),
                backgroundColor: [
                    '#4f46e5', // indigo
                    '#10b981', // emerald
                    '#f59e0b', // amber
                    '#ef4444', // red
                    '#8b5cf6', // violet
                    '#ec4899', // pink
                    '#06b6d4', // cyan
                    '#84cc16', // lime
                ],
                borderWidth: 0
            }
        ]
    }
})

const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                    size: 12
                }
            }
        },
        tooltip: {
            callbacks: {
                label: function(context: any) {
                    const label = context.label || ''
                    const value = context.parsed || 0
                    return `${label}: $${value.toLocaleString()}`
                }
            }
        }
    }
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getPaymentMethodBadge = (method: string) => {
    const badges: Record<string, string> = {
        cash: 'bg-emerald-100 text-emerald-800',
        card: 'bg-indigo-100 text-indigo-800',
        transfer: 'bg-amber-100 text-amber-800',
        check: 'bg-rose-100 text-rose-800'
    }
    return badges[method] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
    <AuthenticatedLayout>
        <!-- Header -->
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-800">Profit & Loss Statement</h2>
            <p class="text-gray-600 mt-1">Comprehensive financial overview and expense tracking</p>
        </div>

        <!-- Date Range Filter -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Filter by Date Range</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                        v-model="dateFrom"
                        type="date"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                        v-model="dateTo"
                        type="date"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div class="flex items-end">
                    <button
                        @click="applyFilter"
                        class="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="expensesStore.loading" class="flex items-center justify-center h-64">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p class="mt-4 text-gray-600">Loading financial data...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="expensesStore.error" class="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-8">
            <p class="text-rose-800">{{ expensesStore.error }}</p>
        </div>

        <!-- Content -->
        <div v-else>
            <!-- Profit & Loss Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Revenue Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
                    <p class="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                    <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(totalRevenue) }}</p>
                </div>

                <!-- Gross Profit Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
                    <p class="text-sm font-medium text-gray-600 mb-1">Gross Profit</p>
                    <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(grossProfit) }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ grossProfitMargin.toFixed(2) }}% margin</p>
                </div>

                <!-- Total Expenses Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
                    <p class="text-sm font-medium text-gray-600 mb-1">Total Expenses</p>
                    <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(totalExpenses) }}</p>
                </div>

                <!-- Net Profit Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4" :class="netProfit >= 0 ? 'border-emerald-500' : 'border-rose-500'">
                    <p class="text-sm font-medium text-gray-600 mb-1">Net Profit</p>
                    <p class="text-2xl font-bold" :class="netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                        {{ formatCurrency(netProfit) }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">{{ netProfitMargin.toFixed(2) }}% margin</p>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Expenses Table (2/3 width) -->
                <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Expense Details</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                                    <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Payment</th>
                                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr
                                    v-for="expense in expensesStore.expenseList"
                                    :key="expense.id"
                                    class="hover:bg-gray-50 transition-colors">
                                    <td class="px-4 py-3 text-sm text-gray-600">
                                        {{ formatDate(expense.expense_date) }}
                                    </td>
                                    <td class="px-4 py-3 text-sm font-medium text-gray-800">
                                        {{ expense.category }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-600">
                                        {{ expense.description }}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getPaymentMethodBadge(expense.payment_method)">
                                            {{ expense.payment_method }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-right font-semibold text-rose-600">
                                        {{ formatCurrency(expense.amount) }}
                                    </td>
                                </tr>
                                <tr v-if="expensesStore.expenseList.length === 0">
                                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                                        No expenses found for the selected period
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Expense Breakdown Pie Chart (1/3 width) -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
                    <div class="h-80">
                        <Pie v-if="expensesByCategory.length > 0" :data="expenseBreakdownData" :options="pieChartOptions" />
                        <div v-else class="flex items-center justify-center h-full text-gray-500">
                            No expense data available
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Report Section -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">Financial Summary Report</h3>

                <div class="space-y-4">
                    <!-- Revenue Section -->
                    <div class="border-b border-gray-200 pb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-800">Revenue</span>
                            <span class="font-bold text-lg text-indigo-600">{{ formatCurrency(totalRevenue) }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm text-gray-600 ml-4">
                            <span>Number of Transactions</span>
                            <span>{{ dashboardStore.profitLoss?.revenue.number_of_transactions || 0 }}</span>
                        </div>
                    </div>

                    <!-- Cost of Goods Sold -->
                    <div class="border-b border-gray-200 pb-4">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-gray-800">Cost of Goods Sold</span>
                            <span class="font-bold text-lg text-rose-600">{{ formatCurrency(costOfGoodsSold) }}</span>
                        </div>
                    </div>

                    <!-- Gross Profit -->
                    <div class="bg-emerald-50 rounded-lg p-4 mb-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="font-bold text-gray-800">Gross Profit</span>
                                <p class="text-xs text-gray-600 mt-1">{{ grossProfitMargin.toFixed(2) }}% of revenue</p>
                            </div>
                            <span class="font-bold text-2xl text-emerald-600">{{ formatCurrency(grossProfit) }}</span>
                        </div>
                    </div>

                    <!-- Operating Expenses by Category -->
                    <div class="border-b border-gray-200 pb-4">
                        <div class="font-semibold text-gray-800 mb-3">Operating Expenses</div>
                        <div v-if="expensesByCategory.length > 0" class="ml-4 space-y-2">
                            <div
                                v-for="category in expensesByCategory"
                                :key="category.category"
                                class="flex justify-between items-center text-sm">
                                <span class="text-gray-600">{{ category.category }}</span>
                                <span class="font-semibold text-gray-800">{{ formatCurrency(category.total) }}</span>
                            </div>
                        </div>
                        <div v-else class="ml-4 text-sm text-gray-500">No expenses recorded</div>
                        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                            <span class="font-semibold text-gray-800">Total Operating Expenses</span>
                            <span class="font-bold text-lg text-amber-600">{{ formatCurrency(totalExpenses) }}</span>
                        </div>
                    </div>

                    <!-- Net Profit -->
                    <div class="rounded-lg p-6" :class="netProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="font-bold text-xl text-gray-800">Net Profit</span>
                                <p class="text-sm text-gray-600 mt-1">{{ netProfitMargin.toFixed(2) }}% of revenue</p>
                            </div>
                            <span class="font-bold text-3xl" :class="netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                                {{ formatCurrency(netProfit) }}
                            </span>
                        </div>
                    </div>

                    <!-- Period Information -->
                    <div class="bg-gray-50 rounded-lg p-4 mt-6">
                        <div class="text-sm text-gray-600">
                            <p><span class="font-semibold">Report Period:</span> {{ formatDate(dateFrom) }} to {{ formatDate(dateTo) }}</p>
                            <p class="mt-1"><span class="font-semibold">Total Expenses Recorded:</span> {{ expensesStore.expenseList.length }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
