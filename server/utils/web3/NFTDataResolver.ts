import { Hex } from "viem";
import { NFTItem } from "~/types/NFTItem";

export interface NFTDataResolver {
  getNFTsByWallet(walletAddress: Hex, collections?: Hex[]): Promise<NFTItem[]>
  getNFTsById(items: { tokenId: string; contractAddress: string }[]): Promise<NFTItem[]>
}
