<template>
  <div
    v-if="showScrollIndicator"
    class="fixed bottom-4 right-4 z-50 animate-bounce cursor-pointer"
    @click="scrollToBottom"
  >
    <div class="bg-green-700 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showScrollIndicator = ref(false)

const checkScrollable = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  // Show if page is scrollable and not at bottom
  showScrollIndicator.value = scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 100
}

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
}

onMounted(() => {
  checkScrollable()
  window.addEventListener('scroll', checkScrollable)
  window.addEventListener('resize', checkScrollable)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScrollable)
  window.removeEventListener('resize', checkScrollable)
})
</script>
