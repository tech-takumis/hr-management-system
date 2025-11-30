<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { DocumentTextIcon, ChartBarIcon, CalendarDaysIcon  } from '@heroicons/vue/24/outline'

const router = useRouter()
const dashboardStore = useDashboardStore()

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

// State
const showReportModal = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const reportPeriod = ref<'monthly' | 'weekly'>('monthly')

// Computed
const loading = computed(() => dashboardStore.loading)
const salesTrend = computed(() => dashboardStore.dashboard?.sales_trend || [])

// Process sales trend data into monthly breakdown
const monthlySalesData = computed(() => {
    if (!salesTrend.value || salesTrend.value.length === 0) {
        return []
    }

    return salesTrend.value.map(trend => {
        // Parse the date to get month name
        const trendDate = new Date(trend.date)
        const monthName = trendDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

        // Ensure numeric values
        const total = Number(trend.total) || 0
        const count = Number(trend.count) || 0

        return {
            month: monthName,
            sales: total,
            orders: count,
            average: count > 0 ? total / count : 0
        }
    })
})

// Computed totals
const totalSales = computed(() => {
    return monthlySalesData.value.reduce((sum, item) => sum + (Number(item.sales) || 0), 0)
})

const totalOrders = computed(() => {
    return monthlySalesData.value.reduce((sum, item) => sum + (Number(item.orders) || 0), 0)
})

const averageOrderValue = computed(() => {
    return totalOrders.value > 0 ? totalSales.value / totalOrders.value : 0
})

// Chart data
const monthlySalesChartData = computed(() => ({
    labels: monthlySalesData.value.map(item => item.month),
    datasets: [
        {
            label: 'Monthly Sales',
            data: monthlySalesData.value.map(item => item.sales),
            borderColor: '#10b981', // green-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)', // semi-transparent green
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10b981', // green-500
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }
    ]
}))


const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: {
                label: function(context: any) {
                    return `Sales: $${context.parsed.y.toLocaleString()}`
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                callback: function(value: any) {
                    return '$' + value.toLocaleString()
                }
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    }
}

// Functions
const fetchSalesData = async () => {
    await dashboardStore.fetchDashboard('month')
}

const openReportModal = () => {
    showReportModal.value = true
}

const closeReportModal = () => {
    showReportModal.value = false
}

const refreshData = async () => {
    await fetchSalesData()
}

const setPeriod = (period: 'monthly' | 'weekly') => {
    reportPeriod.value = period
}

const generateReport = () => {
    // Redirect to the appropriate route based on period
    if (reportPeriod.value === 'weekly') {
        router.push({
            name: 'weekly-sales',
            query: {
                from: dateFrom.value,
                to: dateTo.value
            }
        })
    } else if (reportPeriod.value === 'monthly') {
        router.push({
            name: 'monthly-sales',
            query: {
                from: dateFrom.value,
                to: dateTo.value
            }
        })
    }
    // Close modal after redirecting
    closeReportModal()
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)
}

// Set default dates (current year)
const setDefaultDates = () => {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    dateFrom.value = startOfYear.toISOString().split('T')[0]
    dateTo.value = today.toISOString().split('T')[0]
}

// Lifecycle
onMounted(async () => {
    setDefaultDates()
    await fetchSalesData()
})
</script>

<template>
    <AuthenticatedLayout>
        <!-- Header with Dashboard Style -->
        <div class="mb-6">
            <div class="bg-gray-100 rounded-lg shadow-md p-4 border border-gray-200">
                <div class="flex items-center justify-between flex-wrap gap-4">
                    <!-- Title -->
                    <div>
                        <h2 class="text-2xl font-bold text-green-600">Sales Report</h2>
                        <p class="text-sm text-gray-600 mt-1">View and analyze your sales performance</p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-3">
                        <!-- Refresh Button -->
                        <button
                            :disabled="loading"
                            class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg hover:bg-green-50 transition-colors shadow-md disabled:opacity-50"
                            @click="refreshData">
                            <svg
                                class="w-5 h-5"
                                :class="{ 'animate-spin': loading }"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {{ loading ? 'Loading...' : 'Refresh' }}
                        </button>

                        <!-- Generate Report Button -->
                        <button
                            class="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                            @click="openReportModal">
                            <DocumentTextIcon class="w-5 h-5" />
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-96">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>

        <!-- No Data State -->
        <div v-else-if="monthlySalesData.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No sales data</h3>
            <p class="mt-1 text-sm text-gray-500">No sales found for the selected period.</p>
            <div class="mt-6">
                <button
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    @click="refreshData">
                    Refresh Data
                </button>
            </div>
        </div>

        <!-- Monthly Sales Report Card -->
        <div v-else class="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-yellow-600 mb-6">Monthly Sales Report</h3>

            <!-- Two Column Layout (6:6 ratio) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left Column - Chart -->
                <div class="bg-white rounded-lg p-6 border border-gray-300">
                    <h4 class="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <ChartBarIcon class="w-5 h-5 text-green-700" />
                        Sales Trend
                    </h4>
                    <div class="h-96">
                        <Line :data="monthlySalesChartData" :options="chartOptions" />
                    </div>
                </div>

                <!-- Right Column - Table -->
                <div class="bg-white rounded-lg p-6 border border-gray-300">
                    <h4 class="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <CalendarDaysIcon class="w-5 h-5 text-red-600"/>
                        Monthly Breakdown
                    </h4>
                    <div class="overflow-y-auto h-96">
                        <table class="min-w-full border border-gray-300 rounded-md">
                            <thead class="sticky top-0 bg-gray-100 border-b border-gray-300">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Sales
                                    </th>
                                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Avg
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-300">
                                <tr
                                    v-for="(item, index) in monthlySalesData"
                                    :key="index"
                                    class="hover:bg-green-50 transition-colors">
                                    <td class="px-4 py-3 text-sm font-medium text-gray-800">
                                        {{ item.month }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-right font-semibold text-green-700">
                                        {{ formatCurrency(item.sales) }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-right text-gray-600">
                                        {{ item.orders }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-right text-gray-600">
                                        {{ formatCurrency(item.average) }}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot class="bg-yellow-100 border border-yellow-300 sticky bottom-0">
                                <tr class="font-bold">
                                    <td class="px-4 py-3 text-sm text-gray-800">Total</td>
                                    <td class="px-4 py-3 text-sm text-right text-gray-800">
                                        {{ formatCurrency(totalSales) }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-right text-red-600">
                                        {{ totalOrders }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-right text-green-600">
                                        {{ formatCurrency(averageOrderValue) }}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Slide-in Modal from Right (5/12 width) -->
        <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full">
            <div
                v-if="showReportModal"
                class="fixed inset-y-0 right-0 z-50 w-full sm:w-5/12 bg-white border border-gray-300 shadow-2xl overflow-y-auto">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-green-700">Generate Report</h3>
                    <button
                        class="text-gray-400 hover:text-red-600 transition-colors"
                        @click="closeReportModal">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="p-6 space-y-6">
                    <!-- Date Range Section -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 mb-4">Date Range</h4>

                        <!-- From Date -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                From Date
                            </label>
                            <input
                                v-model="dateFrom"
                                type="date"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-0 focus:ring-green-600 focus:border-green-600 transition-colors">
                        </div>

                        <!-- To Date -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                To Date
                            </label>
                            <input
                                v-model="dateTo"
                                type="date"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-0 focus:ring-green-600 focus:border-green-600 transition-colors">
                        </div>
                    </div>

                    <!-- Period Selection -->
                    <div>
                        <h4 class="text-sm font-semibold text-gray-700 mb-4">Report Period</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <button
                                class="px-6 py-3 border border-gray-300 rounded-lg font-medium transition-all"
                                :class="reportPeriod === 'weekly'
                                    ? 'bg-green-700 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                                @click="setPeriod('weekly')">
                                Weekly
                            </button>
                            <button
                                class="px-6 py-3 rounded-lg border border-gray-300 font-medium transition-all"
                                :class="reportPeriod === 'monthly'
                                    ? 'bg-green-700 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                                @click="setPeriod('monthly')">
                                Monthly
                            </button>
                        </div>
                    </div>

                    <!-- Report Preview Info -->
                    <div class="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                        <h5 class="text-sm font-semibold text-gray-800 mb-2">Report Details</h5>
                        <div class="space-y-1 text-sm text-gray-800">
                            <p><span class="font-medium">Period:</span> {{ reportPeriod }}</p>
                            <p><span class="font-medium">From:</span> {{ dateFrom || 'Not set' }}</p>
                            <p><span class="font-medium">To:</span> {{ dateTo || 'Not set' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
                    <button
                        class="flex-1 px-6 py-3 bg-red-600 border border-gray-300 text-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        @click="closeReportModal">
                        Cancel
                    </button>
                    <button
                        class="flex-1 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
                        @click="generateReport">
                        Show
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
                v-if="showReportModal"
                class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
                @click="closeReportModal"></div>
        </Transition>
    </AuthenticatedLayout>
</template>

<style scoped>
/* Custom scrollbar for table */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
