import { Hex } from "viem"
import { Deployment } from "~/types/Deployment"

export default defineEventHandler(async (event) => {
  const wallet = event.context.params?.["wallet"] as Hex
  if (!wallet) throw new Error("Wallet address is required")

  const { ankrApiKey } = useRuntimeConfig()
  const { ipfsGateway } = useRuntimeConfig().public

  const nftResolver = new AnkrNFTResolver(ankrApiKey, ipfsGateway, "polygon_amoy")

  const deplJson = await useStorage("assets:deployment").getItem<Deployment>("NietzschessNFT.json")

  if (!deplJson) {
    throw createError({
      statusCode: 500,
      statusMessage: "Deployment file not found",
    })
  }

  const nfts = await nftResolver.getNFTsByWallet(wallet, [deplJson.address])

  return nfts
})
