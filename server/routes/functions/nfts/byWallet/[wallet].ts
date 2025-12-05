import { readFile } from "fs/promises"
import { Hex } from "viem"
import { Deployment } from "~/types/Deployment"
import { AnkrNFTResolver } from "~/web3/AnkrNFTResolver"

export default defineEventHandler(async (event) => {
  const wallet = event.context.params!["wallet"] as Hex

  const nftResolver = new AnkrNFTResolver(process.env.ANKR_API_KEY!, process.env.IPFS_GATEWAY!, "polygon_amoy")

  const deplRaw = await readFile("public/deployment/NietzschessNFT.json", "utf-8")
  const deplJson: Deployment = JSON.parse(deplRaw)

  const nfts = await nftResolver.getNFTsByWallet(wallet, [deplJson.address])

  return nfts
})
