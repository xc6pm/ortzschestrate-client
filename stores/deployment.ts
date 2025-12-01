import type { Deployment } from "~/types/Deployment"

export const useDeploymentStore = defineStore("deploymentStore", () => {
  const bettingDepl = ref<Deployment | null>(null)
  const nietzschessNFTDepl = ref<Deployment | null>(null)
  const marketplaceDepl = ref<Deployment | null>(null)

  const { isOnline } = useNetworkStatus()

  const urls = {
    betting: "/deployment/ORTBet.json",
    nft: "/deployment/NietzschessNFT.json",
    market: "/deployment/NietzschessNFTMarketplace.json",
  }

  const load = async () => {
    try {
      const [b, n, m] = await Promise.all([
        $fetch<Deployment>(urls.betting),
        $fetch<Deployment>(urls.nft),
        $fetch<Deployment>(urls.market),
      ])

      bettingDepl.value = Object.freeze(b)
      nietzschessNFTDepl.value = Object.freeze(n)
      marketplaceDepl.value = Object.freeze(m)
    } catch (err) {
      console.warn("Failed to load deployments.", err)
      bettingDepl.value = nietzschessNFTDepl.value = marketplaceDepl.value = null
    }
  }

  // Initial load
  load()

  // Retry when online
  watch(isOnline, (online) => {
    if (online && bettingDepl.value === null) load()
  })

  return { bettingDepl, nietzschessNFTDepl, marketplaceDepl }
})
