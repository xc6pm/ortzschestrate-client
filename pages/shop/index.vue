<script setup lang="ts">
import { useQuery } from "@urql/vue"
import { useAccount } from "@wagmi/vue"
import { formatEther, type Hex } from "viem"
import type { Listing } from "~/types/Listing"
import type { NFTItem, SaleItem } from "~/types/NFTDataResolver"
import type { TxStatus } from "~/types/TxStatus"

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

const txs: TxStatus[] = []

const handleNewTx = (tx: TxStatus) => {
  console.log("new tx", tx)
  txs.push(tx)
}

console.log("before useQuery")

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
      if (itemOwned) {
        continue
      }

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

// const {
//   state: listings,
//   isReady,
//   isLoading,
// } = useAsyncState(() => {
//   console.log("inside useAsyncState")

//   return subgraphData.value && nftStore.nftDataResolver
//     ? nftStore.nftDataResolver.getNFTsById(
//         subgraphData.value.activeListings.map((al) => ({
//           tokenId: al.listing.id,
//           contractAddress: al.listing.nftContract,
//         }))
//       )
//     : Promise.resolve([])
// }, [], {  watch: [subgraphData, nftStore.nftDataResolver] })
</script>

<template>
  <ShopTxStatusCard
    v-for="tx in txs"
    :is-confirming="tx.isConfirming"
    :is-confirmed="tx.isConfirmed"
    :tx-id="tx.txId"
    :tx-err="tx.txErr"
  />

  <div class="flex justify-between items-center mt-4">
    <h3 v-if="ownedItems.length" class="my-4">Owned Items</h3>

    <UButton v-if="nftStore.isUserNFTOwner" label="Mint" variant="outline" to="/shop/mint" />
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
        :isOwned="true"
        @new-tx="handleNewTx"
      />
    </div>

    <hr class="mt-6" />
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
      />
    </div>
  </div>

  <IndexFooter />
</template>
