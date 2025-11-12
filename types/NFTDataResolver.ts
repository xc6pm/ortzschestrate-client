import type { Hex } from "viem"

export interface OnChainItem {
  token_uri: string
  token_id: BigInt
}

export type IPFSItem = {
  name: string
  description: string
  image: string
  attributes: { trait_type: string; value: string }[]
}

export type NFTItem = {
  tokenId: BigInt
  tokenUri: string
  metadata: IPFSItem
}

export interface NFTDataResolver {
  getNFTsByWallet(walletAddress: Hex, collections?: Hex[]): Promise<NFTItem[]>
}
