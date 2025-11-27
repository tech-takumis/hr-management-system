import axios from '@/lib/axios'
import { useStorage } from '@vueuse/core'
import { defineStore, acceptHMRUpdate } from 'pinia'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type { AxiosError } from 'axios'

interface UserData {
    id?: number
    name?: string
    email?: string
    email_verified_at?: string | null
}

interface RegisterForm {
    name: string
    email: string
    password: string
    password_confirmation: string
}

interface LoginForm {
    email: string
    password: string
    remember?: boolean
}

interface ForgotPasswordForm {
    email: string
}

interface ResetPasswordForm {
    token: string
    email: string
    password: string
    password_confirmation: string
}

interface ValidationError {
    response: {
        status: number
        data: {
            errors: Record<string, string[]>
        }
    }
}

interface UserState {
    userData: UserData
    authStatus: number | null
}

const csrf = () => axios.get('/sanctum/csrf-cookie')

export const useUsers = defineStore('users', {
    state: (): UserState => ({
        userData: useStorage('userData', {} as UserData).value,
        authStatus: useStorage('authStatus', null as number | null).value,
    }),

    getters: {
        authUser: (state): boolean => state.authStatus === 204,
        hasUserData: (state): boolean => Object.keys(state.userData).length > 0,
        hasVerified: (state): boolean =>
            Object.keys(state.userData).length > 0
                ? state.userData.email_verified_at !== null
                : false,
    },

    actions: {
        getData(this: { userData: UserData; router: Router }) {
            axios
                .get<UserData>('/api/user')
                .then(response => {
                    this.userData = response.data
                })
                .catch((error: AxiosError) => {
                    if (error.response?.status !== 409) throw error

                    this.router.push('/verify-email')
                })
        },

        async register(
            this: { authStatus: number | null; router: Router },
            form: Ref<RegisterForm>,
            setErrors: Ref<string[]>,
            processing: Ref<boolean>,
        ) {
            await csrf()

            processing.value = true

            axios
                .post('/register', form.value)
                .then(response => {
                    this.authStatus = response.status
                    processing.value = false

                    this.router.push({ name: 'dashboard' })
                })
                .catch((error: AxiosError<ValidationError>) => {
                    if (error.response?.status !== 422) throw error

                    setErrors.value = Object.values(
                        error.response.data.errors,
                    ).flat()
                    processing.value = false
                })
        },

        async login(
            this: { authStatus: number | null; router: Router },
            form: Ref<LoginForm>,
            setErrors: Ref<string[]>,
            processing: Ref<boolean>,
        ) {
            await csrf()

            processing.value = true

            axios
                .post('/login', form.value)
                .then(response => {
                    this.authStatus = response.status
                    processing.value = false

                    this.router.push({ name: 'dashboard' })
                })
                .catch((error: AxiosError<ValidationError>) => {
                    if (error.response?.status !== 422) throw error

                    setErrors.value = Object.values(
                        error.response.data.errors,
                    ).flat()
                    processing.value = false
                })
        },

        async forgotPassword(
            form: Ref<ForgotPasswordForm>,
            setStatus: Ref<string>,
            setErrors: Ref<string[]>,
            processing: Ref<boolean>,
        ) {
            await csrf()

            processing.value = true

            axios
                .post<{ status: string }>('/forgot-password', form.value)
                .then(response => {
                    setStatus.value = response.data.status
                    processing.value = false
                })
                .catch((error: AxiosError<ValidationError>) => {
                    if (error.response?.status !== 422) throw error

                    setErrors.value = Object.values(
                        error.response.data.errors,
                    ).flat()
                    processing.value = false
                })
        },

        async resetPassword(
            this: { router: Router },
            form: Ref<ResetPasswordForm>,
            setErrors: Ref<string[]>,
            processing: Ref<boolean>,
        ) {
            await csrf()

            processing.value = true

            axios
                .post<{ status: string }>('/reset-password', form.value)
                .then(response => {
                    this.router.push(
                        '/login?reset=' + btoa(response.data.status),
                    )
                    processing.value = false
                })
                .catch((error: AxiosError<ValidationError>) => {
                    if (error.response?.status !== 422) throw error

                    setErrors.value = Object.values(
                        error.response.data.errors,
                    ).flat()
                    processing.value = false
                })
        },

        resendEmailVerification(
            setStatus: Ref<string>,
            processing: Ref<boolean>,
        ) {
            processing.value = true

            axios
                .post<{ status: string }>('/email/verification-notification')
                .then(response => {
                    setStatus.value = response.data.status
                    processing.value = false
                })
        },

        async logout(this: {
            $reset: () => void
            userData: UserData
            authStatus: number | null
            router: Router
        }) {
            await axios
                .post('/logout')
                .then(() => {
                    this.$reset()
                    this.userData = {}
                    this.authStatus = null

                    this.router.push({ name: 'welcome' })
                })
                .catch((error: AxiosError) => {
                    if (error.response?.status !== 422) throw error
                })
        },
    },
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUsers, import.meta.hot))
}
