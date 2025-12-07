import { readFile } from "fs/promises"
import { Hex } from "viem"
import { Deployment } from "~/types/Deployment"
import { AnkrNFTResolver } from "~/web3/AnkrNFTResolver"

export default defineEventHandler(async (event) => {
  const wallet = event.context.params?.["wallet"] as Hex
  if (!wallet) throw new Error("Wallet address is required")

  const { ankrApiKey } = useRuntimeConfig()
  const { ipfsGateway } = useRuntimeConfig().public

  const nftResolver = new AnkrNFTResolver(ankrApiKey, ipfsGateway, "polygon_amoy")

  const deplRaw = await readFile("public/deployment/NietzschessNFT.json", "utf-8")
  const deplJson: Deployment = JSON.parse(deplRaw)

  const nfts = await nftResolver.getNFTsByWallet(wallet, [deplJson.address])

  return nfts
})
