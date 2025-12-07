<script setup lang="ts">
const nftStore = useNFTStore()
if (!nftStore.isUserNFTOwner) {
  navigateTo("/shop")
}
</script>

<template>
  <ShopMintNFTPanel class="mt-8" />

  <UButton to="/shop/owned" class="block text-center mt-4" variant="outline" label="Owned Items" />
  <UButton to="/shop" class="block text-center mb-4 mt-3" variant="outline" label="All Listings" />

  <IndexFooter />
</template>
