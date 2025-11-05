import { readContract } from "@wagmi/core"
import { useAccount } from "@wagmi/vue"
import type { Abi } from "viem"
import type { Deployment } from "~/types/Deployment"

export const useNFTStore = defineStore("nftStore", () => {
  const userStore = useUserStore()
  const blockchainAccount = useAccount()
  const { config } = useWagmi()
  const deployment = ref<Deployment | null>(null)
  const isUserNFTOwner = ref(false)

  // Use this inside this store to ensure we try to load the deployment if it has failed before.
  const tryLoadDeployment: () => Promise<Deployment | null> = async () => {
    if (deployment.value) return deployment.value

    const nftContract = "NietzschessNFT"
    const nftContractDeployment = `/deployment/${nftContract}.json`
    try {
      const depl = await $fetch<Deployment>(nftContractDeployment)
      deployment.value = Object.freeze(depl)
    } catch {
      deployment.value = null
    }
    return deployment.value
  }

  tryLoadDeployment()

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

    const depl = await tryLoadDeployment()
    if (!depl) {
      console.log("Deployment not found")
      isUserNFTOwner.value = false
      return
    }

    console.log("depl json", depl)
    const res = await readContract(config, {
      abi: depl.abi as Abi,
      address: depl.address,
      functionName: "owner",
      args: [],
    })

    console.log("readContract result", res, (res as `0x${string}`) === blockchainAccount.address.value)

    isUserNFTOwner.value = (res as `0x${string}`) === blockchainAccount.address.value
  })

  return { deployment, isUserNFTOwner }
})
