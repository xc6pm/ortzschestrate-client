<script setup lang="ts">
// Mock data for NFTs - replace with actual contract data later
const nftItems = ref([
  {
    id: 1,
    title: "Chess King #001",
    price: "0.05",
    image: "https://placehold.co/400x400/1f2937/10b981?text=King+%23001",
  },
  {
    id: 2,
    title: "Chess Queen #002",
    price: "0.08",
    image: "https://placehold.co/400x400/1f2937/10b981?text=Queen+%23002",
  },
  {
    id: 3,
    title: "Chess Knight #003",
    price: "0.03",
    image: "https://placehold.co/400x400/1f2937/10b981?text=Knight+%23003",
  },
  {
    id: 4,
    title: "Chess Rook #004",
    price: "0.04",
    image: "https://placehold.co/400x400/1f2937/10b981?text=Rook+%23004",
  },
  {
    id: 5,
    title: "Chess Bishop #005",
    price: "0.03",
    image: "https://placehold.co/400x400/1f2937/10b981?text=Bishop+%23005",
  },
  {
    id: 6,
    title: "Chess Pawn #006",
    price: "0.01",
    image: "https://placehold.co/400x400/1f2937/10b981?text=Pawn+%23006",
  },
])

const nftStore = useNFTStore()
</script>

<template>
  <div class="flex justify-end mb-4 mt-4">
    <UButton v-if="nftStore.isUserNFTOwner" label="Mint" variant="outline" to="/shop/mint" />
  </div>

  <div class="pb-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ShopItemCard
        v-for="item in nftItems"
        :key="item.id"
        :title="item.title"
        :price="item.price"
        :image="item.image"
      />
    </div>
  </div>

  <IndexFooter />
</template>
