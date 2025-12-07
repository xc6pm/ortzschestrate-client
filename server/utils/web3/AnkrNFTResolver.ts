import type { Hex } from "viem"
import type { NFTItem } from "~/types/NFTItem"
import { PinataResolver } from "./PinataResolver"
import { NFTDataResolver } from "./NFTDataResolver"

export class AnkrNFTResolver implements NFTDataResolver {
  apiKey: string
  pinataResolver: PinataResolver
  chain: string
  // Find ankr chain names on: https://www.ankr.com/docs/advanced-api/nft-methods/#parameters
  constructor(ankrApiKey: string, ipfsGateway: string, ankrChainName: string) {
    this.apiKey = ankrApiKey
    this.pinataResolver = new PinataResolver(ipfsGateway)
    this.chain = ankrChainName
  }

  async getNFTsByWallet(walletAddress: Hex, collections?: Hex[]): Promise<NFTItem[]> {
    if (collections?.length) {
      collections = collections.map((c) => c.toLowerCase() as Hex)
    }

    const url = `https://rpc.ankr.com/multichain/${this.apiKey}`
    console.log("Fetching NFTs from Ankr for wallet", walletAddress, "on chain", this.chain)
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "ankr_getNFTsByOwner",
        params: {
          blockchain: this.chain,
          pageSize: 20,
          walletAddress: walletAddress,
        },
      }),
    }

    const response = await fetch(url, options)

    if (!response.ok) throw new Error(response.status + ":" + response.statusText)

    const { result } = (await response.json()) as {
      result: { assets: { tokenId: string; tokenUrl: "https://ipfs.io/ipfs/${cid}"; contractAddress: Hex }[] }
    }

    console.log("Ankr returned", result.assets.length, "NFTs for wallet", walletAddress)

    const cidStart = "https://ipfs.io/ipfs/${cid}".lastIndexOf("/") + 1
    const displayItems = await this.pinataResolver.resolveItemsDisplayInfo(
      collections && collections.length
        ? result.assets
            .filter((item) => collections.includes(item.contractAddress.toLowerCase() as Hex))
            .map((item) => ({
              token_uri: `ipfs://${item.tokenUrl.substring(cidStart)}`,
              token_id: BigInt(item.tokenId),
            }))
        : result.assets.map((item) => ({
            token_uri: `ipfs://${item.tokenUrl.substring(cidStart)}`,
            token_id: BigInt(item.tokenId),
          }))
    )

    return displayItems
  }

  async getNFTsById(items: { tokenId: string; contractAddress: string }[]): Promise<NFTItem[]> {
    // Ankr doesn't provide a function for batch fetching items by id so for now, we just read them from the chain.
    throw new Error("AnkrNFTResolver.getNFTsById not implemented yet")
  }
}
