<script setup lang="ts">
import { useEtherscanUrlConstructor } from "#imports"
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
const { urlToTx } = useEtherscanUrlConstructor()

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
  let uploadRes: PinataUploadResponse
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

  writeContract({
    address: nftStore.deployment!.address,
    abi: nftStore.deployment!.abi as Abi,
    functionName: "safeMint",
    args: [account.address.value, uploadRes.cid],
  })

  console.log("writeContract ran", writeContractErr)
}

const uploadToPinata = async () => {
  const pinataJwt = useRuntimeConfig().public.pinataJwt
  const imageForm = new FormData()
  imageForm.append("file", nftData.image!)
  imageForm.append("name", nftData.name)
  imageForm.append("network", "public")

  const imageUploadRes = await $fetch<{ data: PinataUploadResponse }>("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: imageForm,
  })

  const metadata = {
    name: nftData.name,
    description: nftData.description,
    image: `ipfs://${imageUploadRes.data.cid}`,
    attributes: attributes.value.map((a) => ({ trait_type: a.key, value: a.value })),
  }
  const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" })
  const jsonForm = new FormData()
  jsonForm.append("file", blob, "metadata.json")
  jsonForm.append("name", nftData.name)
  jsonForm.append("network", "public")

  const jsonUploadRes = await $fetch<{ data: PinataUploadResponse }>("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: jsonForm,
  })

  return jsonUploadRes.data
}

const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: writeContractTx })

watchEffect(() => {
  if (isConfirmed.value) {
    loading.value = false
  }
})

interface PinataUploadResponse {
  id: string
  group_id: string | null
  name: string
  cid: string
  created_at: string
  size: number
  number_of_files: number
  mime_type: string
  vectorized: false
  network: "public" | "private"
  keyvalues: { [key: string]: string }
}

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
          <UFileUpload v-model="nftData.image" accept="image/*" />
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

    <!-- Transaction Status Card -->
    <UCard v-if="isConfirming || isConfirmed" class="mt-4">
      <!-- Transaction in Progress -->
      <div v-if="isConfirming" class="flex items-center gap-3">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-blue-500" />
        <div>
          <p class="font-medium">Transaction in progress</p>
          <p class="text-sm text-gray-500">
            tx:
            <a
              :href="urlToTx(writeContractTx!)"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-blue-400 cursor-pointer"
            >
              {{ `${writeContractTx!.slice(0, 6)}...${writeContractTx!.slice(-4)}` }}
            </a>
          </p>
        </div>
      </div>

      <!-- Transaction Confirmed (Success) -->
      <div v-else-if="isConfirmed && !writeContractErr" class="flex items-center gap-3">
        <UIcon name="i-heroicons-check-circle" class="text-green-500 text-2xl" />
        <div>
          <p class="font-medium text-green-600">Transaction confirmed!</p>
          <p class="text-sm text-gray-500">
            tx:
            <a
              :href="urlToTx(writeContractTx!)"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-blue-400 cursor-pointer"
            >
              {{ `${writeContractTx!.slice(0, 6)}...${writeContractTx!.slice(-4)}` }}
            </a>
          </p>
        </div>
      </div>

      <!-- Transaction Failed -->
      <div v-else-if="isConfirmed && writeContractErr" class="flex items-start gap-3">
        <UIcon name="i-heroicons-x-circle" class="text-red-500 text-2xl shrink-0" />
        <div class="flex-1">
          <p class="font-medium text-red-600">Transaction failed</p>
          <p class="text-sm text-gray-500 mb-2">
            tx:
            <a
              :href="urlToTx(writeContractTx!)"
              target="_blank"
              rel="noopener noreferrer"
              class="underline hover:text-blue-400 cursor-pointer"
            >
              {{ `${writeContractTx!.slice(0, 6)}...${writeContractTx!.slice(-4)}` }}
            </a>
          </p>
          <p class="text-sm text-red-600 bg-red-50 p-2 rounded">
            {{ writeContractErr.message || writeContractErr }}
          </p>
        </div>
      </div>
    </UCard>
  </main>
</template>
