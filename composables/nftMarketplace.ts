import { useAccount } from "@wagmi/vue"
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core"
import type { Abi, Hex } from "viem"

/**
 * Ensures the marketplace contract is approved to transfer the NFT.
 * Call this before listing an item for sale.
 * @returns { ensureApproved, isApproving, error } - Call ensureApproved(tokenId) to check/request approval
 */
export const useEnsureItemApprovedForSale = () => {
  const account = useAccount()
  const { nietzschessNFTDepl, marketplaceDepl } = useDeployment()
  const wagmi = useWagmi()
  const toast = useToast()

  const isApproving = ref(false)
  const error = ref<Error | null>(null)

  const ensureApproved = async (tokenId: bigint): Promise<boolean> => {
    error.value = null

    if (!account.address.value) {
      error.value = new Error("Wallet not connected")
      return false
    }

    if (!nietzschessNFTDepl.value || !marketplaceDepl.value) {
      error.value = new Error("Contract deployments not found")
      return false
    }

    try {
      // Check if marketplace is already approved for all tokens
      const isApproved = await readContract(wagmi.config, {
        abi: nietzschessNFTDepl.value.abi as Abi,
        address: nietzschessNFTDepl.value.address as Hex,
        functionName: "isApprovedForAll",
        args: [account.address.value, marketplaceDepl.value.address],
      })

      if (isApproved) {
        return true
      }

      // Request approval
      console.log("Requesting marketplace approval...")
      isApproving.value = true

      toast.add({
        title: "Approval Required",
        description: "Please approve the marketplace to transfer your NFT",
        color: "info",
      })

      const approvalTxHash = await writeContract(wagmi.config, {
        abi: nietzschessNFTDepl.value.abi as Abi,
        address: nietzschessNFTDepl.value.address as Hex,
        functionName: "setApprovalForAll",
        args: [marketplaceDepl.value.address, true],
      })

      console.log("Approval transaction sent:", approvalTxHash)

      // Wait for approval transaction to confirm
      await waitForTransactionReceipt(wagmi.config, {
        hash: approvalTxHash,
      })

      toast.add({
        title: "Approval Confirmed",
        description: "You can now list your NFT",
        color: "success",
      })

      isApproving.value = false
      return true
    } catch (err: any) {
      console.error("Approval error:", err)
      error.value = err
      isApproving.value = false

      toast.add({
        title: "Approval Failed",
        description: err?.message || "Failed to approve marketplace",
        color: "error",
      })

      return false
    }
  }

  return {
    ensureApproved,
    isApproving: readonly(isApproving),
    error: readonly(error),
  }
}
