<script setup lang="ts">
import { useAccount, useWriteContract } from "@wagmi/vue"
import { parseEther, type Hex } from "viem"
import type { FormError } from "@nuxt/ui/dist/runtime/types"
import { useContractStateStore } from "~/stores/contractState"

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
    toast.add({ description: "Wallet verified successfully", color: "green" })
  }
  await userStore.fetch()
}

const dropdownItems = ref([
  [
    {
      label: "deposit",
      click: () => {
        modalState.amount = 0
        isDepositModal = true
        isModalOpen.value = true
      },
    },
    {
      label: "withdraw",
      click: () => {
        modalState.amount = 0
        isDepositModal = false
        isModalOpen.value = true
      },
    },
    {
      label: "disconnect",
      click: () => {
        wagmiAdapter.disconnect()
      },
    },
  ],
])

const invalidateVerifyButton = () => {
  if (!walletVerified.value) {
    dropdownItems.value[0] = [
      {
        label: "verify",
        click: () => verifyWallet(),
      },
      ...dropdownItems.value[0],
    ]
  } else if (dropdownItems.value[0].find((item) => item?.label === "verify")) {
    dropdownItems.value[0].splice(0, 1)
  }
}

watch(walletVerified, invalidateVerifyButton)

invalidateVerifyButton()

const errors = ref<FormError[]>([])
const validate = (state: { amount: number }): FormError[] => {
  const minimumAmount = 0.0001
  if (state.amount < minimumAmount) errors.value = [{ path: "amount", message: `The minimum is ${minimumAmount} ETH.` }]
  else errors.value = []
  return errors.value
}

validate(modalState)
</script>

<template>
  <UDropdown :items="dropdownItems">
    <UButton color="oxford-blue">
      {{ account.address.value?.substring(0, 5) }}...{{
        account.address.value?.substring(account.address.value.length - 4, account.address.value.length)
      }}
      ({{ contractState.stakesEth }} ETH)
    </UButton>
  </UDropdown>

  <UModal v-model="isModalOpen">
    <UCard>
      <UForm :state="modalState" :validate="validate">
        <UFormGroup label="Amount" name="amount">
          <UInput v-model="modalState.amount" type="number" />
        </UFormGroup>
        <UButton type="submit" @click="amountEntered" block class="mt-3"> Submit </UButton>
        <UButton type="cancel" @click="() => (isModalOpen = false)" block class="mt-3" color="white"> Cancel </UButton>
      </UForm>
    </UCard>
  </UModal>
</template>
