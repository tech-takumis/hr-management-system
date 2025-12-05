<script setup lang="ts">
import { useUsers } from '@/stores/user'
import { computed, ref } from 'vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import TextInput from '@/components/TextInput.vue'
import InputLabel from '@/components/InputLabel.vue'
import ValidationErrors from '@/components/ValidationErrors.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const store = useUsers()

const form = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
})

const processing = ref<boolean>(false)
const setErrors = ref<string[]>([])
const showPassword = ref<boolean>(false)
const showPasswordConfirmation = ref<boolean>(false)

const errors = computed(() => setErrors.value)

const submitRegister = () => {
    store.register(form, setErrors, processing)
}
</script>

<template>
    <GuestLayout>
        <ValidationErrors class="mb-4" :errors="errors" />

        <form @submit.prevent="submitRegister">
            <div>
                <InputLabel for="name" value="Name" />
                <TextInput
                    id="name"
                    v-model="form.name"
                    type="text"
                    class="mt-1 block w-full"
                    required
                    autofocus
                    autocomplete="name" />
            </div>

            <div class="mt-4">
                <InputLabel for="email" value="Email" />
                <TextInput
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="mt-1 block w-full"
                    required
                    autocomplete="username" />
            </div>

            <div class="mt-4">
                <InputLabel for="password" value="Password" />
                <div class="relative">
                    <TextInput
                        id="password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        class="mt-1 block w-full pr-10"
                        required
                        autocomplete="new-password" />
                    <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                        :title="showPassword ? 'Hide password' : 'Show password'"
                    >
                        <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
                        <EyeIcon v-else class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div class="mt-4">
                <InputLabel
                    for="password_confirmation"
                    value="Confirm Password" />
                <div class="relative">
                    <TextInput
                        id="password_confirmation"
                        v-model="form.password_confirmation"
                        :type="showPasswordConfirmation ? 'text' : 'password'"
                        class="mt-1 block w-full pr-10"
                        required
                        autocomplete="new-password" />
                    <button
                        type="button"
                        @click="showPasswordConfirmation = !showPasswordConfirmation"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                        :title="showPasswordConfirmation ? 'Hide password' : 'Show password'"
                    >
                        <EyeSlashIcon v-if="showPasswordConfirmation" class="h-5 w-5" />
                        <EyeIcon v-else class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between mt-4">
                <router-link
                    to="/login"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    ← Back to Login
                </router-link>

                <div class="flex items-center">
                    <router-link
                        to="/login"
                        class="underline text-sm text-gray-600 hover:text-gray-900">
                        Already registered?
                    </router-link>

                    <PrimaryButton class="ml-4" :processing="processing">
                        Register
                    </PrimaryButton>
                </div>
            </div>
        </form>
    </GuestLayout>
</template>
