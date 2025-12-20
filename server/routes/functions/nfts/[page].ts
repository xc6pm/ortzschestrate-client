import { createPublicClient, formatEther, Hex, http } from "viem"
import { Deployment } from "~/types/Deployment"
import { Listing } from "~/types/Listing"
import { gql, request } from "graphql-request"
import type { SaleItem, NFTItem } from "~/types/NFTItem"
import { polygonAmoy } from "viem/chains"

export default defineEventHandler(async (event): Promise<SaleItem[]> => {
  const subgraphData = (await fetchFromSubgraph()) as { activeListings: { id: string; listing: Listing }[] }

  const itemsToFetch = subgraphData.activeListings.map((al) => ({
    tokenId: al.listing.tokenId,
    contractAddress: al.listing.nftContract,
  }))

  const runtimeConfig = useRuntimeConfig()
  const deplJson = await useStorage("assets:deployment").getItem<Deployment>("NietzschessNFT.json")

  if (!deplJson) {
    throw createError({
      statusCode: 500,
      statusMessage: "Deployment file not found",
    })
  }

  const pinataResolver = new PinataResolver(runtimeConfig.public.ipfsGateway)

  const publicClient = createPublicClient({ chain: polygonAmoy, transport: http() })

  const promises: Promise<SaleItem>[] = []
  for (let i = 0; i < itemsToFetch.length; i++) {
    const item = itemsToFetch[i]
    promises.push(
      publicClient
        .readContract({
          abi: deplJson.abi!,
          address: item.contractAddress as Hex,
          functionName: "tokenURI",
          args: [item.tokenId],
        })
        .then((tokenUri) =>
          pinataResolver
            .resolveItemDisplayInfo({ token_uri: tokenUri as string, token_id: BigInt(item.tokenId) })
            .then((nftItem: NFTItem) => {
              const subgraphItem = subgraphData!.activeListings[i].listing
              return {
                tokenId: nftItem.tokenId,
                tokenUri: nftItem.tokenUri,
                metadata: nftItem.metadata,
                priceWei: subgraphItem.price,
                priceEth: formatEther(BigInt(subgraphItem.price)),
                listedAt: subgraphItem.listedAt,
                updatedAt: subgraphItem.updatedAt,
                seller: subgraphItem.seller.id as Hex,
              }
            })
        )
    )
  }

  const res = (await Promise.all(promises)).flat()

  return res
})

const fetchFromSubgraph = () => {
  const runtimeConfig = useRuntimeConfig()

  const query = gql`
    {
      activeListings(first: 20, orderBy: id, orderDirection: desc) {
        id
        listing {
          id
          nftContract
          tokenId
          price
          metadata
          listedAt
          updatedAt
          seller {
            id
          }
        }
      }
    }
  `

  const url = runtimeConfig.public.nftMarketplaceSubgraphUrl
  const headers = { Authorization: `Bearer ${runtimeConfig.theGraphStudioApiKey}` }

  return request(url, query, {}, headers)
}
