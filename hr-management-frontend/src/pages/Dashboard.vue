<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Line, Pie } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useDashboardStore } from '@/stores/dashboard'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const dashboardStore = useDashboardStore()

// Fetch dashboard data on mount
onMounted(async () => {
    await dashboardStore.fetchDashboard('today')
    await dashboardStore.fetchProfitLoss({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    })
})

// Computed properties for stats
const totalSales = computed(() => dashboardStore.summary?.total_sales || 0)
const totalOrders = computed(() => dashboardStore.summary?.total_transactions || 0)
const totalProfit = computed(() => dashboardStore.summary?.net_profit || 0)
const totalExpenses = computed(() => dashboardStore.summary?.total_expenses || 0)

// Sales Trend Chart Data
const salesTrendData = computed(() => {
    const trend = dashboardStore.dashboard?.sales_trend || []
    return {
        labels: trend.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Sales',
                data: trend.map(item => item.total),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    }
})

const salesTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    }
}

// Profit/Loss Pie Chart Data
const profitLossPieData = computed(() => {
    const pl = dashboardStore.profitLoss
    if (!pl) return { labels: [], datasets: [] }

    return {
        labels: ['Gross Profit', 'Operating Expenses', 'Net Profit'],
        datasets: [
            {
                data: [
                    pl.gross_profit,
                    pl.operating_expenses.total,
                    pl.net_profit
                ],
                backgroundColor: [
                    '#10b981', // emerald-500
                    '#f59e0b', // amber-500
                    '#6366f1'  // indigo-500
                ],
                borderWidth: 0
            }
        ]
    }
})

const profitLossPieOptions = {
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

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)
}
</script>

<template>
    <AuthenticatedLayout>
        <!-- Loading State -->
        <div v-if="dashboardStore.loading" class="flex items-center justify-center h-64">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p class="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="dashboardStore.error" class="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p class="text-rose-800">{{ dashboardStore.error }}</p>
        </div>

        <!-- Dashboard Content -->
        <div v-else>
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Sales Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 ">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Total Sales</p>
                            <p class="text-3xl font-bold text-gray-800">{{ formatCurrency(totalSales) }}</p>
                        </div>
                        <div class="bg-indigo-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Total Orders Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 ">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                            <p class="text-3xl font-bold text-gray-800">{{ totalOrders.toLocaleString() }}</p>
                        </div>
                        <div class="bg-emerald-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Total Profit Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 ">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Total Profit</p>
                            <p class="text-3xl font-bold text-gray-800">{{ formatCurrency(totalProfit) }}</p>
                        </div>
                        <div class="bg-emerald-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Total Expenses Card -->
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 ">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Expenses</p>
                            <p class="text-3xl font-bold text-gray-800">{{ formatCurrency(totalExpenses) }}</p>
                        </div>
                        <div class="bg-rose-100 rounded-full p-3">
                            <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sales Trend Graph -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
                <div class="h-80">
                    <Line :data="salesTrendData" :options="salesTrendOptions" />
                </div>
            </div>

            <!-- Sales Report and Profit/Loss Section -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Sales Report (7 columns) -->
                <div class="lg:col-span-7 bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Sales Report</h3>
                    <div class="h-80">
                        <Line :data="salesTrendData" :options="salesTrendOptions" />
                    </div>

                    <!-- Sales Summary -->
                    <div class="mt-6 grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm text-gray-600 mb-1">Average Daily Sales</p>
                            <p class="text-xl font-bold text-gray-800">
                                {{ formatCurrency(totalSales / (dashboardStore.dashboard?.sales_trend.length || 1)) }}
                            </p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm text-gray-600 mb-1">Total Transactions</p>
                            <p class="text-xl font-bold text-gray-800">{{ totalOrders }}</p>
                        </div>
                    </div>
                </div>

                <!-- Profit/Loss Pie Chart (5 columns) -->
                <div class="lg:col-span-5 bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Profit & Loss</h3>
                    <div class="h-64">
                        <Pie :data="profitLossPieData" :options="profitLossPieOptions" />
                    </div>

                    <!-- P&L Summary -->
                    <div v-if="dashboardStore.profitLoss" class="mt-6 space-y-3">
                        <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                            <span class="text-sm text-gray-600">Gross Profit</span>
                            <span class="text-sm font-semibold text-emerald-600">
                                {{ formatCurrency(dashboardStore.profitLoss.gross_profit) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                            <span class="text-sm text-gray-600">Operating Expenses</span>
                            <span class="text-sm font-semibold text-amber-600">
                                {{ formatCurrency(dashboardStore.profitLoss.operating_expenses.total) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center pt-2">
                            <span class="text-sm font-semibold text-gray-800">Net Profit</span>
                            <span class="text-lg font-bold text-indigo-600">
                                {{ formatCurrency(dashboardStore.profitLoss.net_profit) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <span class="text-sm text-gray-600">Profit Margin</span>
                            <span class="text-sm font-semibold text-gray-800">
                                {{ (dashboardStore.profitLoss.net_profit_margin * 100).toFixed(2) }}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>