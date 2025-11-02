<script setup lang="ts">
import UserButton from "~/components/auth/UserButton.vue"
import WalletButton from "~/components/wallet/WalletButton.vue"

const userStore = useUserStore()
</script>

<template>
  <header class="bg-gray-800 text-white py-4 shadow-md">
    <UContainer class="max-w-7xl mx-auto px-4 flex justify-between items-center">
      <NuxtLink to="/"><span class="text-3xl font-bold text-green-400">nietzschess</span></NuxtLink>

      <div class="relative flex flex-row gap-3">
        <NuxtLink to="/shop" class="text-white hover:text-green-400 transition-colors font-medium mt-1 mr-1">
          Shop
        </NuxtLink>

        <WalletButton v-if="userStore.user" />

        <UserButton />
      </div>
    </UContainer>
  </header>

  <UContainer class="max-w-7xl mx-auto px-4">
    <slot />
  </UContainer>
</template>
