<script setup lang="ts">
import { useAccount } from "@wagmi/vue"
import type { SaleItem } from "~/types/NFTDataResolver"

const nftStore = useNFTStore()
const account = process.client ? useAccount() : { status: ref("disconnected"), address: ref(null) }
const userStore = useUserStore()

const { data: listings } = await useFetch<SaleItem[]>("/functions/nfts/1")
</script>

<template>
  <div v-if="account.status.value === 'connected'" class="flex justify-between items-end my-4">
    <h3 class="mt-0">Listings</h3>

    <div>
      <UButton v-if="userStore.user" label="Owned Items" variant="outline" to="/shop/owned" />

      <UButton
        v-if="userStore.user && nftStore.isUserNFTOwner"
        label="Mint"
        variant="outline"
        to="/shop/mint"
        class="ml-1.5"
      />
    </div>
  </div>

  <main class="my-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ShopItemCard
        v-for="item in listings"
        :key="item.tokenId.toString()"
        :token-id="typeof item.tokenId === 'string' ? BigInt(item.tokenId) : item.tokenId"
        :title="item.metadata.name"
        :price="item.priceEth"
        :image="item.metadata.image"
        :is-owned="item.seller.toLowerCase() === account.address.value?.toLowerCase()"
        :can-buy="
          account.status.value === 'connected' && item.seller.toLowerCase() !== account.address.value?.toLowerCase()
        "
        :listed="true"
      />
    </div>
  </main>

  <IndexFooter />
</template>
