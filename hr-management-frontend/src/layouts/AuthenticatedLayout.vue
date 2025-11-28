<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useUsers } from '@/stores/user'
import { useRoute } from 'vue-router'
import ScrollIndicator from '@/components/ScrollIndicator.vue'


const sidebarOpen = ref<boolean>(false)
const sidebarCollapsed = useStorage('sidebarCollapsed', false)

const store = useUsers()
const route = useRoute()

const auth = store.authUser

// Computed width classes for sidebar
const sidebarWidthClass = computed(() =>
    sidebarCollapsed.value ? 'w-20' : 'w-64'
)

// Computed margin for main content
const mainContentMarginClass = computed(() =>
    sidebarCollapsed.value ? 'lg:ml-20' : 'lg:ml-64'
)

onMounted(() => {
    store.getData()
})

const submitLogout = () => {
    store.logout()
}

const closeSidebar = () => {
    sidebarOpen.value = false
}

const toggleCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
    <div v-if="auth" class="min-h-screen bg-white">
        <!-- Sidebar for Desktop -->
        <aside
            class="fixed inset-y-0 left-0 bg-green-700 flex flex-col transform transition-all duration-300 ease-in-out z-30 lg:translate-x-0"
            :class="[
                sidebarWidthClass,
                { '-translate-x-full': !sidebarOpen }
            ]">
<!-- Logo Section with Collapse Toggle -->
<div class="flex flex-col items-center py-6 border-b border-white bg-green-700 flex-shrink-0">
    <router-link
        to="/dashboard"
        :class="sidebarCollapsed ? 'mx-auto' : ''"
        @click="closeSidebar"
    >
        <img 
            src="@/assets/logo.png" 
            alt="App Logo"
            :class="sidebarCollapsed ? 'h-10 w-auto' : 'h-16 w-auto'"
            class="object-contain transition-all duration-300"
        />
    </router-link>

    <!-- User Info (only when expanded) -->
    <div v-if="!sidebarCollapsed" class="mt-4 text-center text-white">
        <p class="font-semibold text-xl">CARBC</p>
        <p class="text-sm opacity-90">Municipality of Santiago</p>
    </div>
</div>

<!-- Collapse Toggle Button (Professional Design - Top Right) -->
<div v-if="!sidebarCollapsed" class="hidden lg:block absolute top-6 -right-3 z-40">
    <button
        @click="toggleCollapse"
        class="bg-green-600 hover:bg-green-500 text-white rounded-full p-2 shadow-lg border-2 border-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400"
    >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
    </button>
</div>
            <!-- Expand Button (When Collapsed - Inside Sidebar Design) -->
            <div v-if="sidebarCollapsed" class="hidden lg:flex justify-center py-3">
                <button
                    @click="toggleCollapse"
                    class="bg-green-500 hover:bg-green-400 text-white rounded-full p-2 shadow-md border-2 border-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <!-- Dashboard -->
                <div class="relative group">
                    <router-link
                        to="/dashboard"
                        class="flex items-center py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                        :class="[
                            route.path === '/dashboard'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                : 'hover:bg-green-400 hover:shadow-md',
                            sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                        ]"
                        :title="sidebarCollapsed ? 'Dashboard' : ''"
                        @click="closeSidebar">
                        <svg
                            class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                            :class="{ 'mr-3': !sidebarCollapsed }"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span v-if="!sidebarCollapsed" class="font-medium">Dashboard</span>
                    </router-link>
                    
                    <!-- Tooltip for collapsed state -->
                    <div v-if="sidebarCollapsed" class="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[100] shadow-lg" style="left: 100%; margin-left: 8px; top: 50%; transform: translateY(-50%);">
                        Dashboard
                        <div class="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                </div>

                <!-- Sales Report -->
                <div class="relative group">
                    <router-link
                        to="/sales/report"
                        class="flex items-center py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                        :class="[
                            route.path === '/sales/report'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                : 'hover:bg-green-400 hover:shadow-md',
                            sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                        ]"
                        :title="sidebarCollapsed ? 'Sales Report' : ''"
                        @click="closeSidebar">
                        <svg
                            class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                            :class="{ 'mr-3': !sidebarCollapsed }"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span v-if="!sidebarCollapsed" class="font-medium">Sales Report</span>
                    </router-link>
                    
                    <!-- Tooltip for collapsed state -->
                    <div v-if="sidebarCollapsed" class="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[100] shadow-lg" style="left: 100%; margin-left: 8px; top: 50%; transform: translateY(-50%);">
                        Sales Report
                        <div class="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                </div>

                <!-- Profit & Loss -->
                <div class="relative group">
                    <router-link
                        to="/profit/loss"
                        class="flex items-center py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                        :class="[
                            route.path === '/profit/loss'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                : 'hover:bg-green-400 hover:shadow-md',
                            sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                        ]"
                        :title="sidebarCollapsed ? 'Profit & Loss' : ''"
                        @click="closeSidebar">
                        <svg
                            class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                            :class="{ 'mr-3': !sidebarCollapsed }"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span v-if="!sidebarCollapsed" class="font-medium">Profit & Loss</span>
                    </router-link>
                    
                    <!-- Tooltip for collapsed state -->
                    <div v-if="sidebarCollapsed" class="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[100] shadow-lg" style="left: 100%; margin-left: 8px; top: 50%; transform: translateY(-50%);">
                        Profit & Loss
                        <div class="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                </div>

                <!-- Sales Record -->
                <div class="relative group">
                    <router-link
                        to="/sales/record"
                        class="flex items-center py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                        :class="[
                            route.path === '/sales/record'
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                : 'hover:bg-green-400 hover:shadow-md',
                            sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                        ]"
                        :title="sidebarCollapsed ? 'Sales Record' : ''"
                        @click="closeSidebar">
                        <svg
                            class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                            :class="{ 'mr-3': !sidebarCollapsed }"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span v-if="!sidebarCollapsed" class="font-medium">Sales Record</span>
                    </router-link>
                    
                    <!-- Tooltip for collapsed state -->
                    <div v-if="sidebarCollapsed" class="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[100] shadow-lg" style="left: 100%; margin-left: 8px; top: 50%; transform: translateY(-50%);">
                        Sales Record
                        <div class="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                </div>
            </nav>

            <!-- Logout Button Fixed at Bottom -->
            <div class="p-4 border-none flex-shrink-0">
                <button
                    class="flex items-center w-full py-3 text-gray-800 bg-white rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200"
                    :class="sidebarCollapsed ? 'justify-center px-0' : 'px-4'"
                    :title="sidebarCollapsed ? 'Logout' : ''"
                    @click="submitLogout">
                    <svg
                        class="w-5 h-5"
                        :class="{ 'mr-3': !sidebarCollapsed }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span v-if="!sidebarCollapsed" class="font-medium">Logout</span>
                </button>
            </div>
        </aside>

        <!-- Mobile Overlay -->
        <div
            v-if="sidebarOpen"
            class="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
            @click="closeSidebar"></div>

        <!-- Main Content Area -->
        <div class="transition-all duration-300" :class="mainContentMarginClass">
            <!-- Page Content -->
            <main class="p-4 sm:p-6 lg:p-8 pt-8">
                <slot />
            </main>
        </div>
        
        <!-- Scroll Indicator -->
        <ScrollIndicator />
    </div>
</template>
