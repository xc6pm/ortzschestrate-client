import type { Hex } from "viem"
import type { OnChainItem, NFTDataResolver, NFTItem } from "~/types/NFTDataResolver"
import { PinataResolver } from "./PinataResolver"

export class MoralisNFTResolver implements NFTDataResolver {
  apiKey: string
  chain: string
  pinataResolver: PinataResolver

  constructor(moralisApiKey: string, ipfsGateway: string, chain: string) {
    this.apiKey = moralisApiKey
    this.chain = chain
    this.pinataResolver = new PinataResolver(ipfsGateway)
  }

  async getNFTsByWallet(walletAddress: Hex, collections: Hex[]): Promise<NFTItem[]> {
    console.log("apiKey", this.apiKey)
    console.log("chain", this.chain)
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key": this.apiKey,
      },
    }

    let fetchUrl = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft?chain=${this.chain}&limit=25&format=decimal`
    if (collections && collections.length) {
      fetchUrl += `&token_addresses%5B0%5D=${collections.join("&token_addresses%5B1%5D=")}`
    }

    const rawRes = await fetch(fetchUrl, options)
    console.log("rawRes", rawRes)

    if (!rawRes.ok) {
      throw new Error(rawRes.status + ":" + rawRes.statusText)
    }

    // Full sample of the api response:
    // https://docs.moralis.com/web3-data-api/evm/reference/get-wallet-nfts
    const { result } = (await rawRes.json()) as { result: OnChainItem[] }

    console.log("OnChainItems", result)

    const displayItems = await this.pinataResolver.resolveDisplayInfo(result)

    console.log("after displayItems")

    return displayItems
  }
}
