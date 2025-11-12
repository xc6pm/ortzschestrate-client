<script setup lang="ts">
interface Props {
  tokenId: bigint
  title: string
  price: string | "owned"
  image: string
}

const props = defineProps<Props>()

const idFormatted = computed(() => `#${props.tokenId.toString().padStart(3, "0")}`)

const handleBuy = () => {
  // TODO: Implement NFT purchase logic
  console.log(`Buying ${props.title} for ${props.price} POL`)
}

const handleSell = () => {}
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
      <div :class="price === 'owned' ? ['flex', 'items-center', 'justify-between'] : []">
        <h3 class="text-lg font-semibold">
          {{ title }} <span class="text-sm text-gray-500">{{ idFormatted }}</span>
        </h3>
        <UButton v-if="price === 'owned'" class="mt-4" color="primary" @click="handleSell">Sell Now</UButton>
      </div>

      <div v-if="price !== 'owned'" class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <span class="text-2xl font-bold text-green-400">{{ price }}</span>
          <span class="text-sm text-gray-500">POL</span>
        </div>

        <UButton @click="handleBuy" color="primary"> Buy Now </UButton>
      </div>
    </div>
  </UCard>
</template>
