<script setup lang="ts">
interface Props {
  title: string
  price: string
  image: string
}

const props = defineProps<Props>()

const handleBuy = () => {
  // TODO: Implement NFT purchase logic
  console.log(`Buying ${props.title} for ${props.price} ETH`)
}
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-0' } }">
    <div class="aspect-square overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <span class="text-2xl font-bold text-green-400">{{ price }}</span>
          <span class="text-sm text-gray-500">ETH</span>
        </div>

        <UButton @click="handleBuy" color="primary"> Buy Now </UButton>
      </div>
    </div>
  </UCard>
</template>
