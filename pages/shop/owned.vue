<script setup lang="ts">
import { useAccount } from "@wagmi/vue"
import type { NFTItem } from "~/types/NFTDataResolver"

definePageMeta({ ssr: false })

const nftStore = useNFTStore()
const account = useAccount()
const userStore = useUserStore()
const ownedItems = ref<NFTItem[] | null>(null)

const fetchOwnedItems = async () => {
  if (!userStore.isWalletVerified) {
    ownedItems.value = null
    return
  }

  if (account.address.value) {
    ownedItems.value = await $fetch<NFTItem[]>(`/functions/nfts/byWallet/${account.address.value}`)
  } else {
    ownedItems.value = null
  }
}

await fetchOwnedItems()
watch([() => account.address.value, () => userStore.isWalletVerified], async () => {
  await fetchOwnedItems()
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

  <div v-if="ownedItems?.length" class="mb-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ShopItemCard
        v-for="item in ownedItems"
        :key="item.tokenId.toString()"
        :token-id="typeof item.tokenId === 'string' ? BigInt(item.tokenId) : item.tokenId"
        :title="item.metadata.name"
        :image="item.metadata.image"
        :is-owned="true"
      />
    </div>
  </div>
  <h4 v-else>No items to display</h4>

  <IndexFooter />
</template>
