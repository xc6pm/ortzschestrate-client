<script setup lang="ts">
import type { Hex } from "viem"

interface Props {
  isConfirming: boolean
  isConfirmed: boolean
  txId: Hex | undefined
  txErr: { message: string } | null
}

const props = defineProps<Props>()

const { urlToTx } = useEtherscanUrlConstructor()
</script>

<template>
  <UCard v-if="isConfirming || isConfirmed" class="mt-4">
    <!-- Transaction in Progress -->
    <div v-if="isConfirming" class="flex items-center gap-3">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-blue-500" />
      <div>
        <p class="font-medium">Transaction in progress</p>
        <p class="text-sm text-gray-500">
          tx:
          <a
            :href="urlToTx(txId!)"
            target="_blank"
            rel="noopener noreferrer"
            class="underline hover:text-blue-400 cursor-pointer"
          >
            {{ `${txId!.slice(0, 6)}...${txId!.slice(-4)}` }}
          </a>
        </p>
      </div>
    </div>

    <!-- Transaction Confirmed (Success) -->
    <div v-else-if="isConfirmed && !txErr" class="flex items-center gap-3">
      <UIcon name="i-heroicons-check-circle" class="text-green-500 text-2xl" />
      <div>
        <p class="font-medium text-green-600">Transaction confirmed!</p>
        <p class="text-sm text-gray-500">
          tx:
          <a
            :href="urlToTx(txId!)"
            target="_blank"
            rel="noopener noreferrer"
            class="underline hover:text-blue-400 cursor-pointer"
          >
            {{ `${txId!.slice(0, 6)}...${txId!.slice(-4)}` }}
          </a>
        </p>
      </div>
    </div>

    <!-- Transaction Failed -->
    <div v-else-if="isConfirmed && txErr" class="flex items-start gap-3">
      <UIcon name="i-heroicons-x-circle" class="text-red-500 text-2xl shrink-0" />
      <div class="flex-1">
        <p class="font-medium text-red-600">Transaction failed</p>
        <p class="text-sm text-gray-500 mb-2">
          tx:
          <a
            :href="urlToTx(txId!)"
            target="_blank"
            rel="noopener noreferrer"
            class="underline hover:text-blue-400 cursor-pointer"
          >
            {{ `${txId!.slice(0, 6)}...${txId!.slice(-4)}` }}
          </a>
        </p>
        <p class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ txErr.message || txErr }}
        </p>
      </div>
    </div>
  </UCard>
</template>
