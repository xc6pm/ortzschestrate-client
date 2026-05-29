import { readFile } from "fs/promises"
import { Hex } from "viem"
import { Deployment } from "~/types/Deployment"
// import { GoldRushNFTResolver } from "/utils/web3/GoldRushNFTResolver"

export default defineEventHandler(async (event) => {
  const wallet = event.context.params!["wallet"] as Hex
  console.log("Fetching NFTs for wallet:", wallet)

  const nftResolver = new GoldRushNFTResolver(process.env.GOLDRUSH_API_KEY!, process.env.IPFS_GATEWAY!, "80002")
  console.log("Initialized GoldRushNFTResolver")
  const deplRaw = await readFile("../../public/deployment/NietzschessNFT.json", "utf-8")
  console.log("Read deployment file")
  const deplJson: Deployment = JSON.parse(deplRaw)
  console.log("Parsed deployment JSON:", deplJson.address)
  return nftResolver.getNFTsByWallet(wallet, [deplJson.address])
})
