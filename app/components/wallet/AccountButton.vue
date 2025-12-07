<script setup lang="ts">
import type { FormError } from "@nuxt/ui"
import { useAccount, useWriteContract } from "@wagmi/vue"
import { parseEther, type Hex } from "viem"
import { useContractStateStore } from "~/stores/contractState.client"

const account = useAccount()
if (!account.isConnected.value) throw new Error("The account must be connected for this component.")

const contractState = useContractStateStore()

const { wagmiAdapter } = useWagmi()

wagmiAdapter.on("accountChanged", async (arg) => {
  console.log("accountChanged", arg)
  await contractState.updateBalance()
})

contractState.updateBalance()

const { writeContract } = useWriteContract({})
const isModalOpen = ref(false)
const modalState = reactive({
  amount: 0,
})
let isDepositModal = true

const amountEntered = async () => {
  if (errors.value.length) {
    return
  }

  const deployment = await contractState.getDeployment()

  if (isDepositModal) {
    writeContract({
      address: deployment.address,
      value: parseEther(modalState.amount.toString()),
      abi: deployment.abi,
      functionName: "depositStakes",
      args: [],
    })
  } else {
    writeContract({
      address: deployment.address,
      abi: deployment.abi,
      functionName: "withdrawStakes",
      args: [parseEther(modalState.amount.toString())],
    })
  }

  isModalOpen.value = false
}

const userStore = useUserStore()
const walletVerified = computed(() => account.address.value === (userStore.user?.verifiedWallet as Hex))
const toast = useToast()

const verifyWallet = async () => {
  if (walletVerified.value) return
  const fetchRes = await $fetch.raw(apiUrl("/wallet/verify"), {
    params: { walletAddress: account.address.value },
    method: "POST",
    credentials: "include",
  })
  if (fetchRes.ok) {
    toast.add({ description: "Wallet verified successfully" })
  }
  await userStore.fetch()
}

const dropdownItems = ref([
  [
    {
      label: "deposit",
      onSelect: () => {
        modalState.amount = 0
        isDepositModal = true
        isModalOpen.value = true
      },
    },
    {
      label: "withdraw",
      onSelect: () => {
        modalState.amount = 0
        isDepositModal = false
        isModalOpen.value = true
      },
    },
    {
      label: "disconnect",
      onSelect: () => {
        wagmiAdapter.disconnect({ id: account.address.value })
      },
    },
  ],
])

const invalidateVerifyButton = () => {
  if (!walletVerified.value) {
    dropdownItems.value[0] = [
      {
        label: "verify",
        onSelect: () => verifyWallet(),
      },
      ...dropdownItems.value[0],
    ]
  } else if (dropdownItems.value[0].find((item) => item?.label === "verify")) {
    dropdownItems.value[0].splice(0, 1)
  }
}

watch(walletVerified, invalidateVerifyButton)

invalidateVerifyButton()

const errors = ref<FormError<string>[]>([])
const validate = (state: Partial<{ amount: number }>): FormError<string>[] => {
  const minimumAmount = 0.0001
  if (state.amount! < minimumAmount)
    errors.value = [{ name: "amount", message: `The minimum is ${minimumAmount} POL.` }]
  else errors.value = []
  return errors.value
}

validate(modalState)

const recentTxStore = useRecentTxStore()
const { urlToTx } = useEtherscanUrlConstructor()

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return "i-heroicons-check-circle"
    case "failed":
      return "i-heroicons-x-circle"
    case "pending":
      return "i-heroicons-arrow-path"
    default:
      return "i-heroicons-question-mark-circle"
  }
}

const txDropdownOpen = ref(false)
let txDropdownTimeout: NodeJS.Timeout | null = null

// Watch for new transactions and show dropdown
watch(
  () => recentTxStore.transactions.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      // Clear any existing timeout
      if (txDropdownTimeout) {
        clearTimeout(txDropdownTimeout)
      }

      // Open the dropdown
      txDropdownOpen.value = true

      // Close after 5 seconds
      txDropdownTimeout = setTimeout(() => {
        txDropdownOpen.value = false
      }, 5000)
    }
  }
)

const transactionItems = computed(() => {
  if (recentTxStore.transactions.length === 0) {
    return [
      [
        {
          label: "No recent transactions",
          disabled: true,
        },
      ],
    ]
  }

  return [
    recentTxStore.transactions.map((tx) => ({
      label: tx.title,
      icon: getStatusIcon(tx.status),
      to: urlToTx(tx.hash),
      target: "_blank",
      labelClass: tx.status === "pending" ? "animate-pulse" : "",
    })),
  ]
})
</script>

<template>
  <div class="flex">
    <UDropdownMenu :items="dropdownItems">
      <UButton color="tertiary" class="text-slate-200 rounded-r-none">
        {{ account.address.value?.substring(0, 5) }}...{{
          account.address.value?.substring(account.address.value.length - 4, account.address.value.length)
        }}
        ({{ contractState.stakesEth }} POL)
      </UButton>
    </UDropdownMenu>
    <UDropdownMenu :items="transactionItems" v-model:open="txDropdownOpen">
      <div class="relative">
        <UButton
          color="tertiary"
          class="text-slate-200 rounded-l-none border-l border-l-gray-600"
          icon="i-heroicons-archive-box"
        />
        <span
          v-if="recentTxStore.transactions.length > 0"
          class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-gray-900"
        />
      </div>
    </UDropdownMenu>
  </div>

  <UModal v-model:open="isModalOpen">
    <template #content>
      <UCard>
        <template #header>
          <p>Enter Amount</p>
        </template>
        <UForm :state="modalState" :validate="validate">
          <UFormField label="Amount" name="amount">
            <UInput v-model="modalState.amount" type="number" />
          </UFormField>
          <UButton type="submit" @click="amountEntered" block class="mt-3"> Submit </UButton>
          <UButton
            type="reset"
            @click="
              () => {
                isModalOpen = false
              }
            "
            block
            class="mt-3"
            color="neutral"
            variant="outline"
          >
            Cancel
          </UButton>
        </UForm>
      </UCard>
    </template>
  </UModal>
</template>
