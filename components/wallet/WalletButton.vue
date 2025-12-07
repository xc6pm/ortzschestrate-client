<script setup lang="ts">
import { useAccount } from "@wagmi/vue"
import AccountButton from "./AccountButton.vue"

const account = useAccount()
</script>

<template>
  <appkit-connect-button v-if="!account.isConnected.value" size="sm" color="oxford-blue" />
  <AccountButton v-else />
</template>
