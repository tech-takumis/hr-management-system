<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
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

// Period selection
type Period = 'today' | 'week' | 'month' | 'year'
const selectedPeriod = ref<Period>('month')

const periodOptions = [
    { value: 'today' as Period, label: 'Today', days: 1 },
    { value: 'week' as Period, label: 'Week', days: 7 },
    { value: 'month' as Period, label: 'Month', days: 30 },
    { value: 'year' as Period, label: 'Year', days: 365 }
]

// Calculate date range based on selected period
const getDateRange = (period: Period) => {
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
        case 'today':
            break
        case 'week':
            startDate.setDate(endDate.getDate() - 7)
            break
        case 'month':
            startDate.setDate(endDate.getDate() - 30)
            break
        case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
    }

    return {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
    }
}

// Fetch dashboard data based on period
const fetchDashboardData = async () => {
    await dashboardStore.fetchDashboard(selectedPeriod.value)

    const dateRange = getDateRange(selectedPeriod.value)
    await dashboardStore.fetchProfitLoss(dateRange)
}

// Fetch dashboard data on mount
onMounted(async () => {
    await fetchDashboardData()
})

// Watch for period changes and refetch data
watch(selectedPeriod, async () => {
    await fetchDashboardData()
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
        labels: trend.map(item =>
            new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        datasets: [
            {
                label: 'Sales',
                data: trend.map(item => item.total),
                borderColor: '#10b981', // green-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)', // semi-transparent green
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
                    '#eab308', // yellow-500
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
        <!-- Period Selector -->
        <div class="mb-6">
            <div class="bg-gray-100 rounded-lg shadow-md p-4 border border-gray-200">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <!-- Title -->
                    <div>
                        <h2 class="text-2xl font-bold text-green-600">Dashboard Overview</h2>
                        <p class="text-sm text-gray-600 mt-1">View your business performance</p>
                    </div>

                    <!-- Period Selection Buttons -->
                    <div class="flex items-center gap-2 bg-white border border-gray-300 p-1 rounded-lg">
                        <button
                            v-for="option in periodOptions"
                            :key="option.value"
                            @click="selectedPeriod = option.value"
                            class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                            :class="selectedPeriod === option.value
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-200'">
                            {{ option.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

<!-- Loading State -->
<div v-if="dashboardStore.loading" class="flex items-center justify-center h-64">
  <div class="flex flex-col items-center">
    
    <!-- Green spinner -->
    <div
      class="animate-spin h-14 w-14 rounded-full border-4 border-green-500 border-t-transparent"
    ></div>

    <!-- Loading text -->
    <p class="mt-4 text-gray-800 font-medium tracking-wide">
      Loading Dashboard...
    </p>
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
<div
  class="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:shadow-xl transition-shadow duration-300 shadow-md flex flex-col sm:flex-row items-center justify-between"
>
  <!-- Text Section -->
  <div class="flex-1 min-w-0 text-center sm:text-left">
    <p class="text-sm font-semibold text-green-600 uppercase tracking-wide truncate">
      Total Sales
    </p>
    <p class="text-3xl sm:text-3xl font-extrabold text-gray-900 mt-2 truncate">
      {{ formatCurrency(totalSales) }}
    </p>
  </div>

  <!-- Icon Section -->
  <div
    class="flex-shrink-0 mt-4 sm:mt-0 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-4 rounded-2xl shadow-md flex items-center justify-center"
  >
    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </div>
</div>


<!-- Total Orders Card -->
<div
  class="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:shadow-xl transition-shadow duration-300 shadow-md flex flex-col sm:flex-row items-center justify-between"
>
  <!-- Text Section -->
  <div class="flex-1 min-w-0 text-center sm:text-left">
    <p class="text-sm font-semibold text-green-600 uppercase tracking-wide truncate">
      Total Orders
    </p>
    <p class="text-3xl sm:text-3xl font-extrabold text-gray-900 mt-2 truncate">
      {{ totalOrders.toLocaleString() }}
    </p>
  </div>

  <!-- Icon Section -->
  <div
    class="flex-shrink-0 mt-4 sm:mt-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-center"
  >
    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  </div>
</div>


<!-- Total Expenses Card -->
<div
  class="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:shadow-xl transition-shadow duration-300 shadow-md flex flex-col sm:flex-row items-center justify-between"
>
  <!-- Text Section -->
  <div class="flex-1 min-w-0 text-center sm:text-left">
    <p class="text-sm font-semibold text-green-600 uppercase tracking-wide truncate">
      Expenses
    </p>
    <p class="text-3xl sm:text-3xl font-extrabold text-gray-900 mt-2 truncate">
      {{ formatCurrency(totalExpenses) }}
    </p>
  </div>

  <!-- Icon Section -->
  <div
    class="flex-shrink-0 mt-4 sm:mt-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-center"
  >
    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
      />
    </svg>
  </div>
</div>


<!-- Total Profit Card -->
<div
  class="bg-green-600 rounded-xl p-6 border border-green-300 hover:shadow-xl transition-shadow duration-300 shadow-md flex flex-col sm:flex-row items-center justify-between"
>
  <!-- Text Section -->
  <div class="flex-1 min-w-0 text-center sm:text-left">
    <p class="text-sm font-semibold text-white uppercase tracking-wide truncate">
      Total Profit
    </p>
    <p class="text-3xl sm:text-3xl font-extrabold text-white mt-2 truncate">
      {{ formatCurrency(totalProfit) }}
    </p>
  </div>

  <!-- Icon Section -->
  <div
    class="flex-shrink-0 mt-4 sm:mt-0 bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-center"
  >
    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  </div>
</div>



            </div>

            <!-- Sales Trend Graph -->
            <div class="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-lg font-semibold text-green-600 uppercase mb-4">Sales Trend</h3>
                <div class="h-80">
                    <Line :data="salesTrendData" :options="salesTrendOptions" />
                </div>
            </div>

            <!-- Sales Report and Profit/Loss Section -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Sales Report (7 columns) -->
                <div class="lg:col-span-7 bg-gray-100 border border-gray-300 rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold text-yellow-600 uppercase mb-4">Sales Report</h3>
                    <div class="h-80">
                        <Line :data="salesTrendData" :options="salesTrendOptions" />
                    </div>

                    <!-- Sales Summary -->
                    <div class="mt-6 grid grid-cols-2 gap-4">
                        <div class="bg-white border border-gray-300 rounded-lg p-4">
                            <p class="text-sm text-green-700 mb-1">Average Daily Sales</p>
                            <p class="text-xl font-bold text-gray-800">
                                {{ formatCurrency(totalSales / (dashboardStore.dashboard?.sales_trend.length || 1)) }}
                            </p>
                        </div>
                        <div class="bg-green-700 border border-green-300 rounded-lg p-4">
                            <p class="text-sm text-white mb-1">Total Transactions</p>
                            <p class="text-xl font-bold text-white">{{ totalOrders }}</p>
                        </div>
                    </div>
                </div>

                <!-- Profit/Loss Pie Chart (5 columns) -->
                <div class="lg:col-span-5 bg-gray-100 border border-gray-300 rounded-lg shadow-md p-6">
                    <h3 class="text-sm font-semibold text-red-700 uppercase mb-4">Profit & Loss</h3>
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
                            <span class="text-sm font-semibold text-green-700">Net Profit</span>
                            <span class="text-lg font-bold text-black">
                                {{ formatCurrency(dashboardStore.profitLoss.net_profit) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center bg-green-100 rounded-md border border-green-300 p-3">
                            <span class="text-sm text-gray-600">Profit Margin</span>
                            <span class="text-sm font-semibold text-black">
                                {{ (dashboardStore.profitLoss.net_profit_margin * 100).toFixed(2) }}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>