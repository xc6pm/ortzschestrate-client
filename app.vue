<script setup lang="ts">
import { NuxtLayout } from "#components"
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
      <ClientOnly>
        <IndexOfflineBanner />
      </ClientOnly>
    </NuxtLayout>
  </UApp>
</template>
