import axios from '@/lib/axios'
import { useStorage } from '@vueuse/core'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AxiosError } from 'axios'
import router from '@/router'

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

interface ValidationErrorResponse {
    errors: Record<string, string[]>
}

const csrf = () => axios.get('/sanctum/csrf-cookie')

export const useUsers = defineStore('users', () => {
    // State
    const userData = useStorage<UserData>('userData', {} as UserData)
    const authStatus = useStorage<number | null>('authStatus', null)

    // Getters
    const authUser = computed(() => {
        const status = Number(authStatus.value)
        // Convert to number to handle both string and number from localStorage
        return status === 200 || status === 204
    })

    const hasUserData = computed(() => Object.keys(userData.value).length > 0)

    const hasVerified = computed(() =>
        Object.keys(userData.value).length > 0
            ? userData.value.email_verified_at !== null
            : false,
    )

    // Actions
    function getData() {
        axios
            .get<UserData>('/api/user')
            .then(response => {
                userData.value = response.data
            })
            .catch((error: AxiosError) => {
                if (error.response?.status !== 409) throw error

                router.push('/verify-email')
            })
    }

    async function register(
        form: Ref<RegisterForm>,
        setErrors: Ref<string[]>,
        processing: Ref<boolean>,
    ) {
        await csrf()

        processing.value = true

        axios
            .post('/register', form.value)
            .then(async response => {
                console.log('Register response status:', response.status)

                // Accept various success status codes
                if (response.status >= 200 && response.status < 300) {
                    authStatus.value = 204

                    // Fetch user data after successful registration
                    try {
                        const userResponse =
                            await axios.get<UserData>('/api/me')
                        userData.value = userResponse.data
                        console.log('User data fetched:', userData.value)
                    } catch (error) {
                        console.error('Failed to fetch user data:', error)
                    }

                    processing.value = false
                    router.push({ name: 'dashboard' })
                } else {
                    console.warn('Unexpected status code:', response.status)
                    processing.value = false
                }
            })
            .catch((error: AxiosError<ValidationErrorResponse>) => {
                console.error(
                    'Register error:',
                    error.response?.status,
                    error.response?.data,
                )

                if (error.response?.status !== 422) throw error

                setErrors.value = Object.values(
                    error.response.data.errors,
                ).flat()
                processing.value = false
            })
    }

    async function login(
        form: Ref<LoginForm>,
        setErrors: Ref<string[]>,
        processing: Ref<boolean>,
    ) {
        await csrf()

        processing.value = true

        axios
            .post('/login', form.value)
            .then(async response => {
                console.log('Login response status:', response.status)

                // Accept various success status codes
                if (response.status >= 200 && response.status < 300) {
                    authStatus.value = response.status

                    // Fetch user data after successful login
                    try {
                        const userResponse =
                            await axios.get<UserData>('/api/user')
                        userData.value = userResponse.data
                        console.log('User data fetched:', userData.value)
                    } catch (error) {
                        console.error('Failed to fetch user data:', error)
                    }

                    processing.value = false
                    await router.push({ name: 'dashboard' })
                } else {
                    console.warn('Unexpected status code:', response.status)
                    processing.value = false
                }
            })
            .catch((error: AxiosError<ValidationErrorResponse>) => {
                console.error(
                    'Login error:',
                    error.response?.status,
                    error.response?.data,
                )

                if (error.response?.status !== 422) throw error

                setErrors.value = Object.values(
                    error.response.data.errors,
                ).flat()
                processing.value = false
            })
    }

    async function forgotPassword(
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
            .catch((error: AxiosError<ValidationErrorResponse>) => {
                if (error.response?.status !== 422) throw error

                setErrors.value = Object.values(
                    error.response.data.errors,
                ).flat()
                processing.value = false
            })
    }

    async function resetPassword(
        form: Ref<ResetPasswordForm>,
        setErrors: Ref<string[]>,
        processing: Ref<boolean>,
    ) {
        await csrf()

        processing.value = true

        axios
            .post<{ status: string }>('/reset-password', form.value)
            .then(response => {
                router.push('/login?reset=' + btoa(response.data.status))
                processing.value = false
            })
            .catch((error: AxiosError<ValidationErrorResponse>) => {
                if (error.response?.status !== 422) throw error

                setErrors.value = Object.values(
                    error.response.data.errors,
                ).flat()
                processing.value = false
            })
    }

    function resendEmailVerification(
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
    }

    async function logout() {
        await axios
            .post('/logout')
            .then(() => {
                userData.value = {}
                authStatus.value = null

                router.push({ name: 'login' })
            })
            .catch((error: AxiosError) => {
                if (error.response?.status !== 422) throw error
            })
    }

    return {
        // State
        userData,
        authStatus,
        // Getters
        authUser,
        hasUserData,
        hasVerified,
        // Actions
        getData,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUsers, import.meta.hot))
}
