<script setup lang="ts">
import UserButton from "~/components/auth/UserButton.vue"
import WalletButton from "~/components/wallet/WalletButton.vue"

const userStore = useUserStore()
</script>

<template>
  <header class="bg-gray-800 text-white py-4 shadow-md">
    <UContainer class="max-w-7xl mx-auto px-4 flex justify-between items-center">
      <NuxtLink to="/"><span class="text-3xl font-bold text-green-400">nietzschess</span></NuxtLink>

      <div class="relative flex flex-row">
        <WalletButton v-if="userStore.user" />

        <UserButton class="ml-2" />
      </div>
    </UContainer>
  </header>

  <UContainer class="max-w-7xl mx-auto px-4">
    <slot />
  </UContainer>
</template>
