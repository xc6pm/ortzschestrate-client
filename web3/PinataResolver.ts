import type { OnChainItem, NFTItem, IPFSItem } from "~/types/NFTDataResolver"

export class PinataResolver {
  readonly ipfsGateway: string

  constructor(ipfsGateway: string) {
    this.ipfsGateway = ipfsGateway
  }

  resolveDisplayInfo = (items: OnChainItem[]): Promise<NFTItem[]> =>
    Promise.all(
      items.map((item) => {
        console.log("attempting to fetch", item)
        if (!item.token_uri) {
          return Promise.resolve<NFTItem>({
            tokenId: item.token_id,
            tokenUri: item.token_uri,
            metadata: { name: "Still loading...", description: "", image: "", attributes: [] },
          })
        }
        const jsonCid = item.token_uri.substring(7)
        console.log("cid", jsonCid)
        const fetchUrl = `${this.ipfsGateway}/ipfs/${jsonCid}`

        return $fetch<IPFSItem>(fetchUrl, { method: "GET" }).then((ipfsItem) => {
          console.log("ipfs item fetched", ipfsItem)
          const imageCid = ipfsItem.image.substring(7)
          const nftItem: NFTItem = {
            tokenId: item.token_id,
            tokenUri: item.token_uri,
            metadata: { ...ipfsItem, image: `${this.ipfsGateway}/ipfs/${imageCid}` },
          }
          return nftItem
        })
      })
    )
}
