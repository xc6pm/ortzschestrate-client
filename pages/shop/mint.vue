<script setup lang="ts">
const nftStore = useNFTStore()
if (!nftStore.isUserNFTOwner) {
  navigateTo("/shop")
}
</script>

<template>
  <ShopMintNFTPanel class="my-8" />

  <IndexFooter />
</template>
