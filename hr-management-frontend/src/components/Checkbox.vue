<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits<{
    'update:checked': [value: boolean | string[] | number[]]
}>()

const props = withDefaults(
    defineProps<{
        checked?: boolean | string[] | number[]
        value?: string | number | null
    }>(),
    {
        checked: false,
        value: null,
    },
)

const proxyChecked = computed({
    get() {
        return props.checked
    },

    set(val) {
        emit('update:checked', val)
    },
})
</script>

<template>
    <input
        v-model="proxyChecked"
        type="checkbox"
        :value="value"
        class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
</template>
