<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
    errors?: string[]
}>()

// Controls visibility of alert
const visible = ref(false)

// Show alert every time new errors arrive
watch(
    () => props.errors,
    (newErrors) => {
        if (newErrors && newErrors.length > 0) {
            visible.value = true
        }
    },
    { deep: true }
)

const closeAlert = () => {
    visible.value = false
}
</script>

<template>
    <transition name="fade-slide">
        <div
            v-if="visible && errors && errors.length > 0"
            class="fixed top-6 right-6 w-72 mb-4 p-4 rounded-lg border border-red-300 bg-red-50/70 backdrop-blur-sm shadow-lg z-50"
        >
            <div class="flex justify-between items-center">
                <p class="font-medium text-red-700">
                    Whoops! Something went wrong.
                </p>

                <!-- Close Button -->
                <button
                    @click="closeAlert"
                    class="text-red-600 hover:text-red-800 text-lg font-bold leading-none"
                >
                    ×
                </button>
            </div>

            <ul class="mt-2 list-disc list-inside text-sm text-red-600">
                <li v-for="(error, key) in errors" :key="key">{{ error }}</li>
            </ul>
        </div>
    </transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px); /* slide from right */
}
</style>
