<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUsers } from '@/stores/user'
import { computed, ref } from 'vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import Checkbox from '@/components/Checkbox.vue'
import TextInput from '@/components/TextInput.vue'
import InputLabel from '@/components/InputLabel.vue'
import ValidationErrors from '@/components/ValidationErrors.vue'

const route = useRoute()
const store = useUsers()

const form = ref({
    email: '',
    password: '',
    remember: false,
})

const processing = ref<boolean>(false)
const setErrors = ref<string[]>([])

const errors = computed(() => setErrors.value)

const status = ref(
    typeof route.query.reset === 'string' && route.query.reset.length > 0
        ? atob(route.query.reset)
        : null
)

const submitLogin = () => {
    processing.value = true
    store.login(form, setErrors, processing)
}
</script>

<template>
  <div class="fixed inset-0 w-full h-screen flex items-center justify-center overflow-hidden">

    <!-- Fullscreen Background Image -->
    <img
      src="@/assets/bg1.jpg"
      alt="Background"
      class="absolute inset-0 w-full h-full object-cover"
    />

    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/30"></div>

    <!-- Login Card -->
    <div class="relative w-full max-w-md rounded-2xl p-10 animate-fade-in z-10 bg-transparent mx-4">

      <!-- Success Message -->
      <div v-if="status" class="mb-4 font-medium text-sm text-green-700 bg-green-100/50 p-3 rounded-lg border border-green-300/50">
        {{ status }}
      </div>

      <!-- Validation Errors -->
      <ValidationErrors class="mb-4" :errors="errors" />

      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="@/assets/logo.png" alt="Logo" class="h-36 w-auto"/> <!-- Increased size -->
      </div>

      <h2 class="text-3xl font-semibold text-center text-white mb-6">
        Sign in to your account
      </h2>

      <form @submit.prevent="submitLogin">

        <!-- Email -->
        <div>
          <InputLabel for="email" value="Email" class="text-white" />
          <TextInput
            id="email"
            v-model="form.email"
            type="email"
            class="mt-1 block w-full border-gray-300 p-2 rounded-lg"
            required
            autofocus
            autocomplete="username"
          />
        </div>

        <!-- Password -->
        <div class="mt-4">
          <InputLabel for="password" value="Password" class="text-white" />
          <TextInput
            id="password"
            v-model="form.password"
            type="password"
            class="mt-1 block w-full border-gray-300 p-2 rounded-lg"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Remember Me -->
        <div class="block mt-3">
          <label class="flex items-center">
            <Checkbox
              v-model="form.remember"
              name="remember"
              :checked="form.remember"
              class="text-green-600 focus:ring-green-500"
            />
            <span class="ml-2 text-sm text-gray-100">Remember me</span>
          </label>
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-between mt-6">
          <router-link
            to="/forgot-password"
            class="underline text-sm text-green-100 hover:text-green-300 transition"
          >
            Forgot password?
          </router-link>

          <PrimaryButton
            class="ml-4 bg-green-500 hover:bg-green-700 text-gray-800 shadow-md px-5 py-2"
            :processing="processing"
          >
            Login
          </PrimaryButton>
        </div>

      </form>
    </div>
  </div>
</template>

<style>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
</style>

