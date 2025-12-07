import type { Hex } from "viem"

export interface OnChainItem {
  token_uri: string
  token_id: bigint
}

export type IPFSItem = {
  name: string
  description: string
  image: string
  attributes: { trait_type: string; value: string }[]
}

export type NFTItem = {
  tokenId: string | bigint
  tokenUri: string
  metadata: IPFSItem
}

export type SaleItem = NFTItem & {
  priceWei: string
  priceEth: string
  listedAt: string
  updatedAt: string
  seller: Hex
}

export interface NFTDataResolver {
  getNFTsByWallet(walletAddress: Hex, collections?: Hex[]): Promise<NFTItem[]>
  getNFTsById(items: { tokenId: string; contractAddress: string }[]): Promise<NFTItem[]>
}
