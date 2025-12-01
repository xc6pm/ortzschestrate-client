import type { Hex } from "viem"
import type { OnChainItem, NFTDataResolver, NFTItem } from "~/types/NFTDataResolver"
import { PinataResolver } from "./PinataResolver"
import { useResolveTokenUrisFromChain } from "~/composables/tokenUris"

// export class GoldRushOnChainItem implements OnChainItem {
//   constructor(private raw) {
//   }
//   get token_uri() {return this.raw.contractAddress}
//   get token_id() {return this.raw.}
// }

export class GoldRushNFTResolver implements NFTDataResolver {
  apiKey: string
  chain: string
  pinataResolver: PinataResolver

  constructor(goldRushApiKey: string, ipfsGateway: string, chainId: string) {
    this.apiKey = goldRushApiKey
    this.chain = chainId
    this.pinataResolver = new PinataResolver(ipfsGateway)
  }

  async getNFTsByWallet(walletAddress: Hex, collections: Hex[]): Promise<NFTItem[]> {
    const options = {
      method: "GET",
      headers: {
        Authentication: `Bearer ${this.apiKey}`,
      },
    }

    let fetchUrl = `https://api.covalenthq.com/v1/${this.chain}/address/${walletAddress}/balances_nft/`

    const rawRes = await fetch(fetchUrl, options)

    if (!rawRes.ok) {
      throw new Error(rawRes.status + ":" + rawRes.statusText)
    }

    // Full sample of the api response:
    // https://docs.moralis.com/web3-data-api/evm/reference/get-wallet-nfts
    const { items } = (await rawRes.json()) as { items: { contract_address: Hex; nft_data: OnChainItem[] }[] }

    const displayItems = await this.pinataResolver.resolveDisplayInfo(
      items.filter((collection) => collections.includes(collection.contract_address)).flatMap((item) => item.nft_data)
    )

    return displayItems
  }

  async getNFTsById(items: { tokenId: string; contractAddress: string }[]): Promise<NFTItem[]> {
    // GoldRush doesn't provide a function for fetching uri by id so we've to fetch it from the blockchain.
    const tokenUris = await useResolveTokenUrisFromChain(items, this.chain)

    const displayItems = await this.pinataResolver.resolveDisplayInfo(
      items.map((item, i) => ({ token_id: BigInt(item.tokenId), token_uri: tokenUris[i] }))
    )

    return displayItems
  }
}
