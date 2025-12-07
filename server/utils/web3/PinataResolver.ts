import type { OnChainItem, NFTItem, IPFSItem } from "~/types/NFTItem"

export class PinataResolver {
  readonly ipfsGateway: string

  constructor(ipfsGateway: string) {
    this.ipfsGateway = ipfsGateway
  }

  resolveItemsDisplayInfo = (items: OnChainItem[]): Promise<NFTItem[]> =>
    Promise.all(items.map(this.resolveItemDisplayInfo))

  resolveItemDisplayInfo = (item: OnChainItem): Promise<NFTItem> => {
    if (!item.token_uri) {
      return Promise.resolve<NFTItem>({
        tokenId: item.token_id.toString(),
        tokenUri: item.token_uri,
        metadata: { name: "Still loading...", description: "", image: "", attributes: [] },
      })
    }
    const jsonCid = item.token_uri.substring(7)
    const fetchUrl = `${this.ipfsGateway}/ipfs/${jsonCid}`

    return $fetch<IPFSItem>(fetchUrl, { method: "GET" }).then((ipfsItem) => {
      const imageCid = ipfsItem.image.substring(7)
      const nftItem: NFTItem = {
        tokenId: item.token_id.toString(),
        tokenUri: item.token_uri,
        metadata: { ...ipfsItem, image: `${this.ipfsGateway}/ipfs/${imageCid}` },
      }
      return nftItem
    })
  }
}
