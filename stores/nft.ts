import { readContract } from "@wagmi/core"
import { useAccount } from "@wagmi/vue"
import type { Abi } from "viem"
import type { Deployment } from "~/types/Deployment"

export const useNFTStore = defineStore("nftStore", () => {
  const userStore = useUserStore()
  const blockchainAccount = useAccount()
  const { config } = useWagmi()
  const isUserNFTOwner = ref(false)

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

    const nftContract = "NietzschessNFT"
    const nftContractDeployment = `/deployment/${nftContract}.json`

    const deployment = Object.freeze(await $fetch<Deployment>(nftContractDeployment))
    if (!deployment) {
      console.log("Deployment not found")
      isUserNFTOwner.value = false
      return
    }

    console.log("depl json", deployment)

    const res = await readContract(config, {
      abi: deployment.abi as Abi,
      address: deployment.address,
      functionName: "owner",
      args: [],
    })

    console.log("readContract result", res, (res as `0x${string}`) === blockchainAccount.address.value)

    isUserNFTOwner.value = (res as `0x${string}`) === blockchainAccount.address.value
  })

  return { isUserNFTOwner }
})
