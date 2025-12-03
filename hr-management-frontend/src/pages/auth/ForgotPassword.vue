<script setup lang="ts">
import { useUsers } from '@/stores/user'
import { computed, ref } from 'vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import TextInput from '@/components/TextInput.vue'
import InputLabel from '@/components/InputLabel.vue'
import ValidationErrors from '@/components/ValidationErrors.vue'

const store = useUsers()

const form = ref({
    email: '',
})

const processing = ref<boolean>(false)

const setStatus = ref<string>('')

const setErrors = ref<string[]>([])

const status = computed(() => setStatus.value)

const errors = computed(() => setErrors.value)

const submit = () => {
    store.forgotPassword(form, setStatus, setErrors, processing)
}
</script>

<template>
    <GuestLayout>
        <div class="mb-4 text-sm text-gray-600">
            Forgot your password? No problem. Just let us know your email
            address and we will email you a password reset link that will allow
            you to choose a new one.
        </div>

        <div v-if="status" class="mb-4 font-medium text-sm text-green-600">
            {{ status }}
        </div>

        <ValidationErrors class="mb-4" :errors="errors" />

        <form @submit.prevent="submit">
            <div>
                <InputLabel for="email" value="Email" />
                <TextInput
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="mt-1 block w-full"
                    required
                    autofocus
                    autocomplete="username" />
            </div>

            <div class="flex items-center justify-between mt-4">
                <router-link
                    to="/login"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    ← Back to Login
                </router-link>

                <PrimaryButton :processing="processing">
                    Email Password Reset Link
                </PrimaryButton>
            </div>
        </form>
    </GuestLayout>
</template>
