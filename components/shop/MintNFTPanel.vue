<script setup lang="ts">
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

const handleMint = async () => {
  // TODO: Implement Pinata upload and on-chain minting
  console.log("NFT Data:", {
    ...nftData,
    attributes: attributes.value,
  })

  // Validate required fields
  if (!nftData.name || !nftData.description || !nftData.image) {
    alert("Please fill in all required fields")
    return
  }

  // Here you'll implement:
  // 1. Upload image to Pinata
  // 2. Create metadata JSON with name, description, image URL, and attributes
  // 3. Upload metadata to Pinata
  // 4. Mint NFT on-chain with metadata URI
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-bold text-center">Mint New NFT</h2>
    </template>

    <UForm :state="nftData" @submit.prevent="handleMint">
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
          <UButton @click="addAttribute" size="sm" color="primary" variant="outline" type="button">
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
            />
          </div>
        </div>

        <p v-else class="text-sm text-gray-500 italic">
          No attributes added yet. Click "Add Attribute" to add custom properties.
        </p>
      </div>

      <!-- Submit Button -->
      <UButton type="submit" block size="lg" class="mt-6"> Mint NFT </UButton>
    </UForm>
  </UCard>
</template>
