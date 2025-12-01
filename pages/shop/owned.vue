<script setup lang="ts">
import { useAccount } from "@wagmi/vue"
import type { NFTItem } from "~/types/NFTDataResolver"

const nftStore = useNFTStore()
const account = useAccount()

const ownedItems = ref<NFTItem[]>([])
watchEffect(async () => {
  if (nftStore.nftDataResolver && account.address.value && nftStore.deployment?.address) {
    ownedItems.value = await nftStore.nftDataResolver.getNFTsByWallet(account.address.value, [
      nftStore.deployment.address,
    ])
  } else {
    ownedItems.value = []
  }
})
</script>

<template>
  <div v-if="account.status.value === 'connected'" class="flex justify-between items-center align-middle my-4">
    <h3 class="mt-0">Owned Items</h3>

    <div>
      <UButton label="All Listings" variant="outline" to="/shop" />
      <UButton v-if="nftStore.isUserNFTOwner" label="Mint" variant="outline" to="/shop/mint" class="ml-1.5" />
    </div>
  </div>

  <div v-if="ownedItems.length" class="mb-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ShopItemCard
        v-for="item in ownedItems"
        :key="item.tokenId.toString()"
        :token-id="item.tokenId"
        :title="item.metadata.name"
        :price="'owned'"
        :image="item.metadata.image"
        :is-owned="true"
      />
    </div>
  </div>
  <h4 v-else>No items to display</h4>

  <IndexFooter />
</template>
