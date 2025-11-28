<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSalesStore } from '@/stores/sales'
import type { Sale } from '@/stores/sales'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'

const route = useRoute()
const router = useRouter()
const salesStore = useSalesStore()

// State
const dateFrom = ref<string>('')
const dateTo = ref<string>('')
const salesData = ref<Sale[]>([])
const loading = ref(false)

// Get date params from route
onMounted(async () => {
    dateFrom.value = route.query.from as string || ''
    dateTo.value = route.query.to as string || ''

    if (dateFrom.value && dateTo.value) {
        await fetchSales()
    } else {
        // If no dates provided, redirect back to sales report
        router.push({ name: 'sales-report' })
    }
})

// Fetch sales data
const fetchSales = async () => {
    loading.value = true
    try {
        await salesStore.fetchSales({
            start_date: dateFrom.value,
            end_date: dateTo.value,
            per_page: 1000 // Get all sales for the period
        })
        salesData.value = salesStore.salesList
    } catch (error) {
        console.error('Error fetching sales:', error)
    } finally {
        loading.value = false
    }
}

// Calendar generation for month view
const generateMonthCalendar = computed(() => {
    if (!dateFrom.value || !dateTo.value) return []

    const start = new Date(dateFrom.value)
    const end = new Date(dateTo.value)
    const months: Array<{
        month: string
        year: number
        weeks: Array<Array<{
            date: Date
            dateString: string
            isInRange: boolean
            isCurrentMonth: boolean
            sales: Sale[]
            totalAmount: number
            totalCount: number
        }>>
    }> = []

    let current = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)

    while (current <= endMonth) {
        const monthName = current.toLocaleDateString('en-US', { month: 'long' })
        const year = current.getFullYear()
        const weeks: Array<Array<any>> = []

        // Get first day of month and last day of month
        const firstDay = new Date(current.getFullYear(), current.getMonth(), 1)
        const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0)

        // Start from the beginning of the week containing the first day
        const calStart = new Date(firstDay)
        calStart.setDate(calStart.getDate() - calStart.getDay())

        // End at the end of the week containing the last day
        const calEnd = new Date(lastDay)
        calEnd.setDate(calEnd.getDate() + (6 - calEnd.getDay()))

        const calCurrent = new Date(calStart)

        while (calCurrent <= calEnd) {
            if (weeks.length === 0 || weeks[weeks.length - 1].length === 7) {
                weeks.push([])
            }

            const dateString = calCurrent.toISOString().split('T')[0]
            const isInRange = calCurrent >= start && calCurrent <= end
            const isCurrentMonth = calCurrent.getMonth() === current.getMonth()

            // Get sales for this date
            const daySales = salesData.value.filter(sale => {
                const saleDate = new Date(sale.sale_date).toISOString().split('T')[0]
                return saleDate === dateString
            })

            const totalAmount = daySales.reduce((sum, sale) => sum + sale.total_amount, 0)
            const totalCount = daySales.length

            weeks[weeks.length - 1].push({
                date: new Date(calCurrent),
                dateString,
                isInRange,
                isCurrentMonth,
                sales: daySales,
                totalAmount,
                totalCount
            })

            calCurrent.setDate(calCurrent.getDate() + 1)
        }

        months.push({
            month: monthName,
            year,
            weeks
        })

        // Move to next month
        current.setMonth(current.getMonth() + 1)
    }

    return months
})

// Summary statistics
const totalSales = computed(() =>
    salesData.value.reduce((sum, sale) => sum + sale.total_amount, 0)
)

const totalTransactions = computed(() => salesData.value.length)

const averageTransaction = computed(() =>
    totalTransactions.value > 0 ? totalSales.value / totalTransactions.value : 0
)

// Monthly breakdown
const monthlyBreakdown = computed(() => {
    const breakdown: { [key: string]: { sales: number; count: number } } = {}

    salesData.value.forEach(sale => {
        const date = new Date(sale.sale_date)
        const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

        if (!breakdown[monthKey]) {
            breakdown[monthKey] = { sales: 0, count: 0 }
        }

        breakdown[monthKey].sales += sale.total_amount
        breakdown[monthKey].count += 1
    })

    return Object.entries(breakdown).map(([month, data]) => ({
        month,
        sales: data.sales,
        count: data.count,
        average: data.count > 0 ? data.sales / data.count : 0
    }))
})

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)
}

// Format date
const formatDate = (date: Date) => {
    return date.getDate()
}

// Day names
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

</script>

<template>
    <AuthenticatedLayout>

<!-- Loading State -->
<div v-if="loading" class="flex items-center justify-center h-64">
  <div class="flex flex-col items-center">
    
    <!-- Green spinner -->
    <div
      class="animate-spin h-14 w-14 rounded-full border-4 border-green-500 border-t-transparent"
    ></div>

    <!-- Loading text -->
    <p class="mt-4 text-gray-800 font-medium tracking-wide">
      Loading Calendar...
    </p>
  </div>
</div>

        <!-- Content -->
        <div v-else>

            <!-- Monthly Breakdown Table -->
            <div v-if="monthlyBreakdown.length > 0" class="bg-gray-100 text-green-600 border border-gray-300 rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-xl font-semibold text-greeb-600 mb-6">Monthly Summary</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Month</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Sales</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Transactions</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Average</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-300">
                            <tr
                                v-for="item in monthlyBreakdown"
                                :key="item.month"
                                class="hover:bg-green-50 transition-colors border border-gray-300">
                                <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ item.month }}</td>
                                <td class="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                                    {{ formatCurrency(item.sales) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-right text-gray-600">{{ item.count }}</td>
                                <td class="px-4 py-3 text-sm text-right text-gray-600">
                                    {{ formatCurrency(item.average) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Calendar View for Each Month -->
            <div
                v-for="monthData in generateMonthCalendar"
                :key="`${monthData.month}-${monthData.year}`"
                class="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">
                    {{ monthData.month }} {{ monthData.year }}
                </h3>

                <!-- Day Headers -->
                <div class="grid grid-cols-7 gap-2 mb-2">
                    <div
                        v-for="day in dayNames"
                        :key="day"
                        class="text-center font-semibold text-gray-700 text-sm py-2">
                        {{ day }}
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div
                    v-for="(week, weekIndex) in monthData.weeks"
                    :key="weekIndex"
                    class="grid grid-cols-7 gap-2 mb-2">
                    <div
                        v-for="(day, dayIndex) in week"
                        :key="dayIndex"
                        class="border border-gray-300 rounded-lg p-3 min-h-[100px] transition-all"
                        :class="{
                            'bg-gray-50 text-gray-400': !day.isCurrentMonth,
                            'bg-white hover:shadow-md': day.isCurrentMonth && day.isInRange,
                            'bg-gray-100': day.isCurrentMonth && !day.isInRange,
                            'border-green-600 border-2': day.totalCount > 0 && day.isInRange
                        }">
                        <div
                            class="text-sm font-semibold mb-2"
                            :class="{
                                'text-gray-800': day.isCurrentMonth && day.isInRange,
                                'text-gray-400': !day.isCurrentMonth || !day.isInRange
                            }">
                            {{ formatDate(day.date) }}
                        </div>

                        <div v-if="day.isInRange && day.isCurrentMonth && day.totalCount > 0" class="space-y-1">
                            <div class="text-xs font-semibold text-yellow-600">
                                {{ formatCurrency(day.totalAmount) }}
                            </div>
                            <div class="text-xs text-green-600">
                                {{ day.totalCount }} {{ day.totalCount === 1 ? 'sale' : 'sales' }}
                            </div>
                        </div>

                        <div v-else-if="day.isInRange && day.isCurrentMonth" class="text-xs text-red-600">
                            No sales
                        </div>
                    </div>
                </div>
            </div>

            <!-- All Transactions List -->
            <div v-if="salesData.length > 0" class="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">All Transactions</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sale #</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Payment</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr
                                v-for="sale in salesData"
                                :key="sale.id"
                                class="hover:bg-gray-50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-800">
                                    {{ new Date(sale.sale_date).toLocaleDateString() }}
                                </td>
                                <td class="px-4 py-3 text-sm font-medium text-gray-800">
                                    {{ sale.sale_number }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600">
                                    {{ sale.customer?.name || 'Walk-in' }}
                                </td>
                                <td class="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    {{ formatCurrency(sale.total_amount) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-center">
                                    <span class="capitalize text-gray-600">{{ sale.payment_method }}</span>
                                </td>
                                <td class="px-4 py-3 text-sm text-center">
                                    <span
                                        class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                                        :class="{
                                            'bg-green-100 text-green-800': sale.payment_status === 'paid',
                                            'bg-yellow-100 text-yellow-800': sale.payment_status === 'pending',
                                            'bg-blue-100 text-blue-800': sale.payment_status === 'partial'
                                        }">
                                        {{ sale.payment_status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
/* Add smooth transitions */
.transition-all {
    transition: all 0.2s ease-in-out;
}
</style>
