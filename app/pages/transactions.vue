<script setup lang="ts">
const txStore = useRecentTxStore()
</script>

<template>
  <UTable :data="txStore.transactions" class="flex-1" />
</template>
