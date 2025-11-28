<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSalesStore } from '@/stores/sales'
import type { Sale } from '@/stores/sales'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue'
import {CalendarDaysIcon, BanknotesIcon  } from '@heroicons/vue/24/outline'

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

// Calendar generation
const generateWeekCalendar = computed(() => {
    if (!dateFrom.value || !dateTo.value) return []

    const start = new Date(dateFrom.value)
    const end = new Date(dateTo.value)
    const weeks: Array<Array<{
        date: Date
        dateString: string
        isInRange: boolean
        sales: Sale[]
        totalAmount: number
        totalCount: number
    }>> = []

    // Start from the beginning of the week (Sunday)
    const current = new Date(start)
    current.setDate(current.getDate() - current.getDay())

    while (current <= end || weeks.length === 0 || (weeks[weeks.length - 1]?.length ?? 0) < 7) {
        if (weeks.length === 0 || (weeks[weeks.length - 1]?.length ?? 0) === 7) {
            weeks.push([])
        }

        const dateString = current.toISOString().split('T')[0]
        const isInRange = current >= start && current <= end

        // Get sales for this date
        const daySales = salesData.value.filter(sale => {
            const saleDate = new Date(sale.sale_date).toISOString().split('T')[0]
            return saleDate === dateString
        })

        const totalAmount = daySales.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0)
        const totalCount = daySales.length

        const currentWeek = weeks[weeks.length - 1]
        if (currentWeek) {
            currentWeek.push({
                date: new Date(current),
                dateString,
                isInRange,
                sales: daySales,
                totalAmount,
                totalCount
            })
        }

        current.setDate(current.getDate() + 1)

        // Stop after showing the complete week that contains the end date
        if (current > end && (weeks[weeks.length - 1]?.length ?? 0) === 7) {
            break
        }
    }

    return weeks
})

// Summary statistics
const totalSales = computed(() =>
    salesData.value.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0)
)

const totalTransactions = computed(() => salesData.value.length)

const averageTransaction = computed(() =>
    totalTransactions.value > 0 ? totalSales.value / totalTransactions.value : 0
)

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value)
}

// Format date
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Day names
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


</script>

<template>
    <AuthenticatedLayout>
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Content -->
        <div v-else>
            <!-- Calendar View -->
            <div class="bg-gray-100 rounded-lg border border-gray-300 p-3">
                <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CalendarDaysIcon class="w-6 h-6 text-green-700" />
                    Sales Calendar
                </h3>
                <!-- Day Headers -->
                <div class="grid grid-cols-7 gap-1 mb-1">
                    <div
                        v-for="day in dayNames"
                        :key="day"
                        class="text-center font-semibold text-gray-700 text-sm py-1">
                        {{ day }}
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div
                    v-for="(week, weekIndex) in generateWeekCalendar"
                    :key="weekIndex"
                    class="grid grid-cols-7 gap-1 mb-1">
                    <div
                        v-for="(day, dayIndex) in week"
                        :key="dayIndex"
                        class="border border-gray-300 rounded-lg p-2 min-h-[100px] transition-all"
                        :class="{
                            'bg-gray-50 text-gray-400': !day.isInRange,
                            'bg-white hover:shadow-md cursor-pointer': day.isInRange,
                            'border-green-500 border-2': day.totalCount > 0
                        }">
                        <div class="text-sm font-semibold mb-1" :class="day.isInRange ? 'text-gray-800' : 'text-gray-400'">
                            {{ formatDate(day.date) }}
                        </div>

                        <div v-if="day.isInRange && day.totalCount > 0" class="space-y-1">
                            <div class="text-xs font-semibold text-yellow-600">
                                {{ formatCurrency(day.totalAmount) }}
                            </div>
                            <div class="text-xs text-green-600">
                                {{ day.totalCount }} {{ day.totalCount === 1 ? 'sale' : 'sales' }}
                            </div>
                        </div>

                        <div v-else-if="day.isInRange" class="text-xs text-red-400">
                            No sales
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sales List -->
            <div v-if="salesData.length > 0" class="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-6 mt-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <BanknotesIcon class="w-6 h-6 text-green-700" />
                    All Transactions
                </h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-300">
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
                        <tbody class="bg-white divide-y divide-gray-300">
                            <tr
                                v-for="sale in salesData"
                                :key="sale.id"
                                class="hover:bg-green-50 transition-colors">
                                <td class="px-4 py-3 text-sm text-gray-800">
                                    {{ new Date(sale.sale_date).toLocaleDateString() }}
                                </td>
                                <td class="px-4 py-3 text-sm font-medium text-gray-800">
                                    {{ sale.sale_number }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600">
                                    {{ sale.customer_name|| 'Walk-in' }}
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
