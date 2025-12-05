import { useAccount, type Config } from "@wagmi/vue"
import { readContract } from "@wagmi/vue/actions"
import type { Abi } from "viem"

export const useNFTStore = defineStore("nftStore", () => {
  const userStore = useUserStore()
  const blockchainAccount = useAccount()
  const { config } = useWagmi()
  const { nietzschessNFTDepl: deployment } = storeToRefs(useDeploymentStore())
  const isUserNFTOwner = ref(false)

  watchEffect(async () => {
    if (!deployment.value) {
      console.log("Deployment not found")
      isUserNFTOwner.value = false
      return
    }

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

    const res = await readContract(config as Config, {
      abi: deployment.value.abi as Abi,
      address: deployment.value.address,
      functionName: "owner",
      args: [],
    })

    console.log("readContract result", res, (res as `0x${string}`) === blockchainAccount.address.value)

    isUserNFTOwner.value = (res as `0x${string}`) === blockchainAccount.address.value
  })

  return { deployment, isUserNFTOwner }
})
