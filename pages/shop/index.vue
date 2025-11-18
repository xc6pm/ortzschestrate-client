<script setup lang="ts">
import { useAccount } from "@wagmi/vue"
import type { NFTItem } from "~/types/NFTDataResolver"
import type { TxStatus } from "~/types/TxStatus"

// // Mock data for NFTs - replace with actual contract data later
// const listedItems = ref([
//   {
//     id: 1n,
//     title: "Chess King #001",
//     price: "0.05",
//     image: "https://placehold.co/400x400/1f2937/10b981?text=King+%23001",
//   },
//   {
//     id: 2n,
//     title: "Chess Queen #002",
//     price: "0.08",
//     image: "https://placehold.co/400x400/1f2937/10b981?text=Queen+%23002",
//   },
//   {
//     id: 3n,
//     title: "Chess Knight #003",
//     price: "0.03",
//     image: "https://placehold.co/400x400/1f2937/10b981?text=Knight+%23003",
//   },
//   {
//     id: 4n,
//     title: "Chess Rook #004",
//     price: "0.04",
//     image: "https://placehold.co/400x400/1f2937/10b981?text=Rook+%23004",
//   },
//   {
//     id: 5n,
//     title: "Chess Bishop #005",
//     price: "0.03",
//     image: "https://placehold.co/400x400/1f2937/10b981?text=Bishop+%23005",
//   },
//   {
//     id: 6n,
//     title: "Chess Pawn #006",
//     price: "0.01",
//     image: "https://placehold.co/400x400/1f2937/10b981?text=Pawn+%23006",
//   },
// ])

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

const listedItems = []
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
        v-for="item in listedItems"
        :key="item.id.toString()"
        :token-id="item.id"
        :title="item.title"
        :price="item.price"
        :image="item.image"
        :is-owned="false"
      />
    </div>
  </div>

  <IndexFooter />
</template>
