<script setup lang="ts">
import { useAccount } from "@wagmi/vue"
import AccountButton from "./AccountButton.vue"

const account = useAccount()
</script>

<template>
  <appkit-connect-button v-if="!account.isConnected.value" size="sm" class="text-white hover:text-green-400 transition-colors font-medium dark" />
  <AccountButton v-else />
</template>
