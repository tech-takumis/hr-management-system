<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
    modelValue?: string | number
}>()

defineEmits<{
    'update:modelValue': [value: string]
}>()

const input = ref<HTMLInputElement | null>(null)

onMounted(() => {
    if (input.value?.hasAttribute('autofocus')) {
        input.value.focus()
    }
})
</script>

<template>
    <input
        ref="input"
        class="w-full px-4 py-2 border border-green-500 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-600 transition-all"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)" />
</template>
