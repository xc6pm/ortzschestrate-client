<script setup lang="ts">
const { isOnline } = useNetworkStatus()

const bannerText = ref<"You're offline." | "Back online." | "">(isOnline ? "" : "You're offline.")

watch(isOnline, (online) => {
  if (!online) {
    bannerText.value = "You're offline."
  } else {
    bannerText.value = "Back online."
    setTimeout(() => {
      bannerText.value = ""
    }, 3000)
  }
})
</script>

<template>
  <transition name="slide-up">
    <div
      v-if="bannerText !== ''"
      class="fixed bottom-0 left-0 right-0 z-50 text-white text-center py-1.5 text-sm shadow-lg"
      :class="bannerText === 'You\'re offline.' ? 'bg-gray-500' : 'bg-green-500'"
    >
      {{ bannerText }}
    </div>
  </transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
