import { readContract, writeContract } from "@wagmi/core"
import { useAccount } from "@wagmi/vue"
import type { Hex } from "viem"

export const useResolveTokenUrisFromChain = (
  items: { tokenId: string; contractAddress: string }[],
  chainId?: number | string
): Promise<string[]> => {
  const account = useAccount()
  const { config, networks } = useWagmi()
  const { nietzschessNFTDepl } = useDeployment()

  if (!chainId) chainId = networks[0].id

  const promises = []
  for (let item of items) {
    if (item.contractAddress !== nietzschessNFTDepl.value?.address) {
      console.log(`Couldn't display ${item.contractAddress}-${item.tokenId} because contract abi is not at hand.`)
    }

    promises.push(
      readContract(config, {
        address: item.contractAddress as Hex,
        abi: nietzschessNFTDepl.value?.abi,
        functionName: "tokenURI",
        args: [item.tokenId],
      }).then((res) => res as string)
    )
  }

  return Promise.all(promises)
}
