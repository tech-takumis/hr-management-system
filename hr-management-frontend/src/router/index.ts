import { createWebHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUsers } from '@/stores/user'
import PageNotFound from '@/pages/errors/404.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'
import SaleReport from '@/pages/SaleReport.vue'
import SalesRecord from '@/pages/SalesRecord.vue'
import ProfitLoss from '@/pages/ProfitLoss.vue'
import ForgotPassword from '@/pages/auth/ForgotPassword.vue'
import ResetPassword from '@/pages/auth/ResetPassword.vue'
import VerifyEmail from '@/pages/auth/VerifyEmail.vue'
import WeeklySalesReport from '@/pages/WeeklySalesReport.vue'
import MonthlySalesReport from '@/pages/MonthlySalesReport.vue'

const APP_NAME = import.meta.env.VITE_APP_NAME

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        guard?: 'auth' | 'guest'
        metaTags?: Array<{
            name?: string
            content?: string
            property?: string
        }>
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/home',
        redirect: '/dashboard',
        meta: {
            guard: 'auth',
        },
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
            title: 'Dashboard',
            guard: 'auth',
        },
    },
    {
        path: '/sales/report',
        name: 'sales-report',
        component: SaleReport,
        meta: {
            title: 'Sales Report',
            guard: 'auth',
        },
    },
    {
        path: '/profit/loss',
        name: 'profit-loss',
        component: ProfitLoss,
        meta: {
            title: 'Profit & Loss',
            guard: 'auth',
        },
    },
    {
        path: '/sales/record',
        name: 'sales-record',
        component: SalesRecord,
        meta: {
            title: 'Sales Record',
            guard: 'auth',
        },
    },
    {
        path: '/weekly/sales',
        name: 'weekly-sales',
        component: WeeklySalesReport,
        meta: {
            title: 'Weekly Sales Report',
            guard: 'auth',
        },
    },
    {
        path: '/monthly/sales',
        name: 'monthly-sales',
        component: MonthlySalesReport,
        meta: {
            title: 'Monthly Sales Report',
            guard: 'auth',
        },
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            title: 'Log in',
            guard: 'guest',
        },
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {
            title: 'Register',
            guard: 'guest',
        },
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: {
            title: 'Forget Password',
            guard: 'guest',
        },
    },
    {
        path: '/password-reset/:token',
        name: 'password-reset',
        component: ResetPassword,
        meta: {
            title: 'Reset Password',
            guard: 'guest',
        },
    },
    {
        path: '/verify-email',
        name: 'verify-email',
        component: VerifyEmail,
        meta: {
            title: 'Email Verification',
            guard: 'auth',
        },
    },
    {
        path: '/page-not-found',
        name: 'page-not-found',
        component: PageNotFound,
        meta: {
            title: 'Page Not Found',
        },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/page-not-found',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation guard

router.beforeEach((to,_, next) => {
    const store = useUsers()

    // Debug logging
    console.log('🔒 Route Guard Debug:', {
        to: to.path,
        isAuthenticated: store.isAuthenticated,
        guard: to.meta.guard
    })

    const auth = store.isAuthenticated

    if (to.matched.some(route => route.meta.guard === 'guest') && auth)
        next({ name: 'dashboard' })
    else if (to.matched.some(route => route.meta.guard === 'auth') && !auth)
        next({ name: 'login' })
    else next()
})

// Page Title and Metadata

router.beforeEach((to, _, next) => {
    const nearestWithTitle = to.matched
        .slice()
        .reverse()
        .find(r => r.meta && r.meta.title)

    const nearestWithMeta = to.matched
        .slice()
        .reverse()
        .find(r => r.meta && r.meta.metaTags)

    if (nearestWithTitle) {
        document.title = nearestWithTitle.meta.title + ' - ' + APP_NAME
    } else {
        document.title = APP_NAME
    }

    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(
        el => el.parentNode?.removeChild(el),
    )

    if (!nearestWithMeta) return next()

    nearestWithMeta.meta.metaTags
        ?.map(tagDef => {
            const tag = document.createElement('meta')

            Object.keys(tagDef).forEach(key => {
                tag.setAttribute(key, tagDef[key as keyof typeof tagDef] || '')
            })

            tag.setAttribute('data-vue-router-controlled', '')

            return tag
        })
        .forEach(tag => document.head.appendChild(tag))

    next()
})

export default router
