// Represents the HistoricalListing entity on the marketplace tracker subgraph.
export interface Listing {
  id: string
  nftContract: string
  tokenId: string
  seller: { id: string }
  price: string
  metadata: string
  listedAt: string
  updatedAt: string
  outcome: string
  closedAt: string
  buyer: { id: string }
}
