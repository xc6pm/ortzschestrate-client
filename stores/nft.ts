import { readContract } from "@wagmi/core"
import { useAccount } from "@wagmi/vue"
import type { Abi } from "viem"
import { useDeployment } from "~/composables/deployment"
import type { NFTDataResolver } from "~/types/NFTDataResolver"
import { GoldRushNFTResolver } from "~/web3/GoldRushNFTResolver"
import { MoralisNFTResolver } from "~/web3/MoralisNFTResolver"

export const useNFTStore = defineStore("nftStore", () => {
  const userStore = useUserStore()
  const blockchainAccount = useAccount()
  const { config, networks } = useWagmi()
  const { nietzschessNFTDepl: deployment } = useDeployment()
  const nftDataResolver = ref<NFTDataResolver | null>()
  const isUserNFTOwner = ref(false)

  const { moralisApiKey, goldRushApiKey, ipfsGateway } = useRuntimeConfig().public
  nftDataResolver.value = new MoralisNFTResolver(moralisApiKey, ipfsGateway, networks[0].id.toString())

  watchEffect(async () => {
    if (!userStore.user || !blockchainAccount.address?.value) {
      console.log("not logged in")
      isUserNFTOwner.value = false
      return
    }

    const walletNotVerified = userStore.user.verifiedWallet !== blockchainAccount.address.value
    if (walletNotVerified) {
      console.log("wallet not verified")
      isUserNFTOwner.value = false
      return
    }

    if (!deployment.value) {
      console.log("Deployment not found")
      isUserNFTOwner.value = false
      return
    }

    const res = await readContract(config, {
      abi: deployment.value.abi as Abi,
      address: deployment.value.address,
      functionName: "owner",
      args: [],
    })

    console.log("readContract result", res, (res as `0x${string}`) === blockchainAccount.address.value)

    isUserNFTOwner.value = (res as `0x${string}`) === blockchainAccount.address.value
  })

  return { deployment, isUserNFTOwner, nftDataResolver }
})
