<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useUsers } from '@/stores/user'
import { useRoute } from 'vue-router'


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
<div class="flex items-center justify-between h-20 bg-green-700 flex-shrink-0 px-4">
    <router-link
        to="/dashboard"
        :class="sidebarCollapsed ? 'mx-auto' : ''"
        @click="closeSidebar"
    >
        <img 
            src="@/assets/logo.png" 
            alt="App Logo"
            class="h-10 w-auto object-contain"
        />
    </router-link>

    <!-- Collapse Toggle Button (Desktop only) -->
    <button
        v-if="!sidebarCollapsed"
        class="hidden lg:block text-white hover:text-white transition-colors"
        @click="toggleCollapse"
    >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
    </button>
</div>
            <!-- Expand Button (When Collapsed) -->
            <div v-if="sidebarCollapsed" class="hidden lg:flex justify-center py-2 border-b border-white">
                <button
                    class="text-white hover:text-white transition-colors"
                    @click="toggleCollapse">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <!-- Dashboard -->
                <router-link
                    to="/dashboard"
                    class="flex items-center py-3 text-white rounded-lg transition-colors duration-200"
                    :class="[
                        route.path === '/dashboard'
                            ? 'bg-green-500 text-white shadow-lg'
                            : 'hover:bg-green-300 hover:text-white',
                        sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                    ]"
                    :title="sidebarCollapsed ? 'Dashboard' : ''"
                    @click="closeSidebar">
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span v-if="!sidebarCollapsed" class="font-medium">Dashboard</span>
                </router-link>

                <!-- Sales Report -->
                <router-link
                    to="/sales/report"
                    class="flex items-center py-3 text-white rounded-lg transition-colors duration-200"
                    :class="[
                        route.path === '/sales-report'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'hover:bg-green-300 hover:text-white',
                        sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                    ]"
                    :title="sidebarCollapsed ? 'Sales Report' : ''"
                    @click="closeSidebar">
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span v-if="!sidebarCollapsed" class="font-medium">Sales Report</span>
                </router-link>

                <!-- Profit & Loss -->
                <router-link
                    to="/profit/loss"
                    class="flex items-center py-3 text-white rounded-lg transition-colors duration-200"
                    :class="[
                        route.path === '/profit-loss'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'hover:bg-indigo-600 hover:text-white',
                        sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                    ]"
                    :title="sidebarCollapsed ? 'Profit & Loss' : ''"
                    @click="closeSidebar">
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span v-if="!sidebarCollapsed" class="font-medium">Profit & Loss</span>
                </router-link>

                <!-- Sales Record -->
                <router-link
                    to="/sales/record"
                    class="flex items-center py-3 text-white rounded-lg transition-colors duration-200"
                    :class="[
                        route.path === '/sales-record'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'hover:bg-indigo-600 hover:text-white',
                        sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                    ]"
                    :title="sidebarCollapsed ? 'Sales Record' : ''"
                    @click="closeSidebar">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span v-if="!sidebarCollapsed" class="font-medium">Sales Record</span>
                </router-link>
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
            <!-- Top Navbar -->
            <header class="bg-white sticky top-0 z-10 border-none">
                <div class="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <!-- Left: Mobile Menu Button + Dashboard Text -->
                    <div class="flex items-center">
                        <!-- Mobile Menu Button -->
                        <button
                            class="mr-4 text-indigo-600 hover:text-indigo-800 lg:hidden"
                            @click="sidebarOpen = !sidebarOpen">
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <!-- Dashboard Title -->
                        <h1 class="text-xl font-semibold text-gray-800">
                            Dashboard
                        </h1>
                    </div>

                    <!-- Right: Username -->
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-800">
                            {{ store.userData.name }}
                        </span>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="p-4 sm:p-6 lg:p-8">
                <slot />
            </main>
        </div>
    </div>
</template>
