import type { Hex } from "viem"
import type { OnChainItem, NFTDataResolver, NFTItem } from "~/types/NFTDataResolver"
import { PinataResolver } from "./PinataResolver"

export class MoralisNFTResolver implements NFTDataResolver {
  apiKey: string
  chain: string
  pinataResolver: PinataResolver

  constructor(moralisApiKey: string, ipfsGateway: string, chainName: string) {
    this.apiKey = moralisApiKey
    this.chain = encodeURIComponent(chainName)
    this.pinataResolver = new PinataResolver(ipfsGateway)
  }

  async getNFTsByWallet(walletAddress: Hex, collections: Hex[]): Promise<NFTItem[]> {
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

    if (!rawRes.ok) {
      throw new Error(rawRes.status + ":" + rawRes.statusText)
    }

    // Full sample of the api response:
    // https://docs.moralis.com/web3-data-api/evm/reference/get-wallet-nfts
    const { result } = (await rawRes.json()) as { result: OnChainItem[] }

    const displayItems = await this.pinataResolver.resolveItemsDisplayInfo(result)

    return displayItems
  }

  async getNFTsById(items: { tokenId: string; contractAddress: string }[]): Promise<NFTItem[]> {
    if (items.length > 25) {
      throw new Error("Maximum of 25 token IDs allowed per request. This is a Moralis limitation.")
    }

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        tokens: items.map(({ tokenId, contractAddress }) => ({
          token_address: contractAddress,
          token_id: tokenId,
        })),
      }),
    }
    console.log(
      "fetching....",
      options.body,
      JSON.stringify({
        tokens: items.map(({ tokenId, contractAddress }) => ({
          token_address: contractAddress,
          token_id: tokenId,
        })),
        normalizeMetadata: false,
        media_items: false,
      })
    )

    const rawRes = await fetch(
      `https://deep-index.moralis.io/api/v2.2/nft/getMultipleNFTs?chain=polygon%20amoy`,
      options
    )

    console.log("rawRes...")

    if (!rawRes.ok) {
      throw new Error(rawRes.status + ":" + rawRes.statusText)
    }

    const result = (await rawRes.json()) as OnChainItem[]

    const displayItems = await this.pinataResolver.resolveItemsDisplayInfo(result)

    return displayItems
  }
}
