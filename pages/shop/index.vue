<script setup lang="ts">
import { useQuery } from "@urql/vue"
import { useAccount } from "@wagmi/vue"
import { formatEther, type Hex } from "viem"
import type { Listing } from "~/types/Listing"
import type { SaleItem } from "~/types/NFTDataResolver"

const nftStore = useNFTStore()
const account = useAccount()

const { data: subgraphData } = await useQuery<{ activeListings: { id: string; listing: Listing }[] }>({
  query:
    "{activeListings(first: 20 orderBy: id orderDirection: desc) { id listing { id nftContract tokenId price metadata listedAt updatedAt seller {id}}}}",
  requestPolicy: "network-only",
  variables: {},
})

const listings = ref<SaleItem[]>([])

watchEffect(async () => {
  if (subgraphData.value && nftStore.nftDataResolver) {
    console.log("tryna fetch")
    const nftItems = await nftStore.nftDataResolver.getNFTsById(
      subgraphData.value.activeListings.map((al) => ({
        tokenId: al.listing.tokenId,
        contractAddress: al.listing.nftContract,
      }))
    )

    const listingsToShow: SaleItem[] = []
    for (let i = 0; i < nftItems.length; i++) {
      const subgraphItem = subgraphData.value.activeListings[i].listing

      const itemOwned = (subgraphItem.seller.id as Hex).toLowerCase() === account.address.value?.toLowerCase()

      const nftItem = nftItems[i]
      listingsToShow.push({
        ...nftItem,
        priceWei: subgraphItem.price,
        priceEth: formatEther(BigInt(subgraphItem.price)),
        listedAt: subgraphItem.listedAt,
        updatedAt: subgraphItem.updatedAt,
        seller: subgraphItem.seller.id as Hex,
        isOwned: itemOwned,
      })
    }

    listings.value = listingsToShow
  } else {
    listings.value = []
  }
})
</script>

<template>
  <div v-if="account.status.value === 'connected'" class="flex justify-between items-end my-4">
    <h3 class="mt-0">Listings</h3>

    <div>
      <UButton label="Owned Items" variant="outline" to="/shop/owned" />

      <UButton v-if="nftStore.isUserNFTOwner" label="Mint" variant="outline" to="/shop/mint" class="ml-1.5" />
    </div>
  </div>

  <div class="my-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ShopItemCard
        v-for="item in listings"
        :key="item.tokenId.toString()"
        :token-id="item.tokenId"
        :title="item.metadata.name"
        :price="item.priceEth"
        :image="item.metadata.image"
        :is-owned="item.isOwned"
        :can-buy="account.status.value === 'connected' && !item.isOwned"
        :listed="true"
      />
    </div>
  </div>

  <IndexFooter />
</template>
