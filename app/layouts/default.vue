<script setup lang="ts">
import UserButton from "~/components/auth/UserButton.vue"
import WalletButton from "~/components/wallet/WalletButton.vue"

const userStore = useUserStore()
const { isMobile } = useIsMobile()

const headerItems = [
  {
    label: "Shop",
    to: "/shop",
    class: !isMobile ? "text-white hover:text-green-400 transition-colors font-medium" : "text-black",
  },
]
</script>

<template>
  <UHeader :ui="{ root: 'bg-gray-800 text-white shadow-md' }" mode="drawer">
    <template #title>
      <NuxtLink to="/"><span class="text-3xl font-bold text-green-400">nietzschess</span></NuxtLink>
    </template>

    <UNavigationMenu :items="headerItems" />

    <template #right>
      <ClientOnly>
        <!-- <WalletButton v-if="userStore.user" /> -->

        <UserButton />
      </ClientOnly>
    </template>
  </UHeader>

  <UContainer class="max-w-7xl mx-auto px-4">
    <slot />
  </UContainer>
</template>
