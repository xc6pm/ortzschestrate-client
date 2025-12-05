<script setup lang="ts">
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "@wagmi/vue"
import type { Abi } from "viem"

interface Attribute {
  id: number
  key: string
  value: string
}

const nftData = reactive({
  name: "",
  description: "",
  image: null as File | null,
})

const attributes = ref<Attribute[]>([])
let nextAttributeId = 1

const addAttribute = () => {
  attributes.value.push({
    id: nextAttributeId++,
    key: "",
    value: "",
  })
}

const removeAttribute = (id: number) => {
  attributes.value = attributes.value.filter((attr) => attr.id !== id)
}

const loading = ref(false)
const nftStore = useNFTStore()
const toast = useToast()
const account = useAccount()
const { data: writeContractTx, error: writeContractErr, writeContract } = useWriteContract()
const { chains } = useWagmi()

const handleMint = async () => {
  loading.value = true
  try {
    console.log("NFT Data:", {
      ...nftData,
      attributes: attributes.value,
    })

    if (!nftData.name || !nftData.description || !nftData.image) {
      alert("Please fill in all required fields")
      return
    }

    await mint()
  } finally {
    loading.value = false
  }
}

const mint = async () => {
  let uploadRes: { cid: string }
  try {
    uploadRes = await uploadToPinata()
  } catch (error) {
    console.error(error)
    toast.add({
      description: "Upload to pinata failed!",
      color: "error",
      duration: 5000,
      icon: "i-heroicons-x-circle",
    })
    return
  }
  resetForm()

  if (!nftStore.deployment) {
    toast.add({
      description: "Couldn't find the NFT contract deployment!",
      color: "error",
      duration: 5000,
      icon: "i-heroicons-x-circle",
    })
    return
  }

  console.log("calling safeMint", account.address.value, uploadRes, nftStore.deployment.address, chains[0].id)
  writeContract({
    address: nftStore.deployment!.address,
    abi: nftStore.deployment!.abi as Abi,
    chainId: chains[0].id,
    functionName: "safeMint",
    args: [account.address.value, uploadRes.cid],
  })

  console.log("writeContract ran", writeContractErr)
}

const uploadToPinata = async () => {
  const form = new FormData()
  form.append("file", nftData.image!)
  form.append("name", nftData.name)
  form.append("description", nftData.description)
  form.append("attributes", JSON.stringify(attributes.value.map((a) => ({ trait_type: a.key, value: a.value }))))

  const uploadRes = await $fetch<{ cid: string }>("/functions/ipfs/upload", {
    method: "POST",
    body: form,
  })

  return uploadRes
}

const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: writeContractTx })

watchEffect(() => {
  if (isConfirmed.value) {
    loading.value = false
  }
})

const resetForm = () => {
  nftData.name = nftData.description = ""
  nftData.image = null
  attributes.value = []
  nextAttributeId = 1
}
</script>

<template>
  <main>
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold text-center">Mint New NFT</h2>
      </template>

      <UForm :state="nftData" @submit.prevent="handleMint" :loading-auto="true">
        <!-- Name Field -->
        <UFormField label="Name" name="name" required class="mb-4">
          <UInput v-model="nftData.name" placeholder="Enter NFT name" required />
        </UFormField>

        <!-- Description Field -->
        <UFormField label="Description" name="description" required class="mb-4">
          <UTextarea
            v-model="nftData.description"
            placeholder="Enter NFT description"
            :rows="4"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Image" name="image" class="mb-4">
          <UFileUpload v-model="nftData.image" accept="image/*" :disabled="loading" />
        </UFormField>

        <!-- Attributes Section -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium">Attributes (Optional)</label>
            <UButton
              @click="addAttribute"
              size="sm"
              color="primary"
              variant="outline"
              type="button"
              :disabled="loading"
            >
              + Add Attribute
            </UButton>
          </div>

          <!-- Attribute List -->
          <div v-if="attributes.length > 0" class="space-y-3">
            <div v-for="attr in attributes" :key="attr.id" class="flex gap-2 items-start">
              <UInput v-model="attr.key" placeholder="Key (e.g., Color)" class="flex-1" />
              <UInput v-model="attr.value" placeholder="Value (e.g., Blue)" class="flex-1" />
              <UButton
                @click="removeAttribute(attr.id)"
                color="error"
                variant="ghost"
                size="sm"
                type="button"
                icon="i-heroicons-trash"
                :disabled="loading"
              />
            </div>
          </div>

          <p v-else class="text-sm text-gray-500 italic">
            No attributes added yet. Click "Add Attribute" to add custom properties.
          </p>
        </div>

        <!-- Submit Button -->
        <UButton type="submit" block size="lg" class="mt-6" :loading="loading"> Mint NFT </UButton>
      </UForm>
    </UCard>

    <ShopTxStatusCard
      :is-confirming="isConfirming"
      :is-confirmed="isConfirmed"
      :tx-id="writeContractTx"
      :tx-err="writeContractErr"
    />
  </main>
</template>
