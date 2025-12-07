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
      let depls: Deployment[]
      if (import.meta.server) {
        const { readFile } = await import("node:fs/promises")
        depls = [
          JSON.parse(await readFile(`public/${urls.betting}`, "utf-8")),
          JSON.parse(await readFile(`public/${urls.nft}`, "utf-8")),
          JSON.parse(await readFile(`public/${urls.market}`, "utf-8")),
        ]
      } else {
        depls = await Promise.all([
          $fetch<Deployment>(urls.betting),
          $fetch<Deployment>(urls.nft),
          $fetch<Deployment>(urls.market),
        ])
      }

      bettingDepl.value = Object.freeze(depls[0]!)
      nietzschessNFTDepl.value = Object.freeze(depls[1]!)
      marketplaceDepl.value = Object.freeze(depls[2]!)
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
