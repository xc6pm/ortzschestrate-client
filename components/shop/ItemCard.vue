<script setup lang="ts">
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "@wagmi/vue"
import { formatEther, parseEther, type Abi, type Hex } from "viem"

interface Props {
  tokenId: bigint
  title: string
  price?: string
  image: string
  isOwned: boolean
  canBuy?: boolean
  listed?: boolean
}

const props = defineProps<Props>()
console.log("props.price", props.price)

const emit = defineEmits(["newTx"])

const idFormatted = computed(() => `#${props.tokenId.toString().padStart(3, "0")}`)

const handleBuy = () => {
  // TODO: Implement NFT purchase logic
  console.log(`Buying ${props.title} for ${props.price} POL`)
}

const account = useAccount()
const showPriceInput = ref<boolean>(false)
const salePrice = ref<number>(0)
const toast = useToast()
const minPrice = 0.01
const { marketplaceDepl, nietzschessNFTDepl } = storeToRefs(useDeploymentStore())
const { chains } = useWagmi()
const { ensureApproved } = useEnsureItemApprovedForSale()
const { writeContract, data, error, isPending } = useWriteContract()
const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: data })
const tx = computed(() => ({
  isConfirming: isConfirming.value,
  isConfirmed: isConfirmed.value,
  txId: data.value,
  txErr: error.value,
}))

const handleSell = async () => {
  if (!props.isOwned || !marketplaceDepl.value) return

  if (!showPriceInput.value) {
    showPriceInput.value = true
    return
  }

  if (salePrice.value < minPrice) {
    toast.add({ title: `Price must be greater than ${minPrice} POL.` })
    return
  }

  const approved = await ensureApproved(props.tokenId)
  if (!approved) {
    return
  }

  writeContract({
    abi: marketplaceDepl.value.abi as Abi,
    address: marketplaceDepl.value.address as Hex,
    account: account.address.value,
    chainId: chains[0].id,
    functionName: "listItem",
    args: [nietzschessNFTDepl.value!.address, props.tokenId, parseEther(salePrice.value.toString()), ""],
  })
  console.log("listItem called")

  emit("newTx", tx)
}

const cancelSell = () => {
  salePrice.value = 0
  showPriceInput.value = false
}
</script>

<template>
  <UCard>
    <div class="aspect-square overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>

    <div>
      <div :class="isOwned && !listed ? ['flex', 'items-center', 'justify-between'] : []">
        <h3 class="text-lg font-semibold">
          {{ title }} <span class="text-sm text-gray-500">{{ idFormatted }}</span>
        </h3>
        <div>
          <UButton v-if="isOwned && !listed" :disabled="isPending" class="mt-4" color="primary" @click="handleSell"
            >Sell Now</UButton
          >
          <UButton v-if="showPriceInput" :disabled="isPending" class="mt-4 ml-0.5" color="error" @click="cancelSell"
            >Cancel</UButton
          >
        </div>
      </div>

      <div v-if="price" class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <span class="text-2xl font-bold text-green-400">{{ price }}</span>
          <span class="text-sm text-gray-500">POL</span>
        </div>

        <UButton @click="handleBuy" color="primary" :disabled="!canBuy"> Buy Now </UButton>
      </div>

      <div v-if="showPriceInput" class="w-full flex mt-2">
        <UInput
          v-model="salePrice"
          type="number"
          autofocus
          :disabled="isPending"
          :min="minPrice"
          :max="99999"
          placeholder="Enter Price"
          class="w-full"
          id="priceInput"
        />
        <span class="ml-2 mt-1">POL</span>
      </div>
    </div>
  </UCard>
</template>
