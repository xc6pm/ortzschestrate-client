import { useWriteContract, useWaitForTransactionReceipt } from "@wagmi/vue"

export const useWriteContractWithTracking = (title: Ref<string> | (() => string)) => {
  const { writeContract, data, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: data })
  const recentTxStore = useRecentTxStore()

  // Watch for new transaction hash and add to store
  watch(data, (newHash, oldHash) => {
    if (newHash && newHash !== oldHash) {
      const txTitle = toValue(title)
      recentTxStore.addTransaction({
        hash: newHash,
        title: txTitle,
        status: "pending",
      })
    }
  })

  // Watch for transaction confirmation and update status
  watch([isConfirming, isConfirmed, error], ([confirming, confirmed, err]) => {
    if (data.value) {
      if (err) {
        recentTxStore.updateTransactionStatus(data.value, "failed")
      } else if (confirmed) {
        recentTxStore.updateTransactionStatus(data.value, "success")
      }
    }
  })

  const tx = computed(() => ({
    isConfirming: isConfirming.value,
    isConfirmed: isConfirmed.value,
    txId: data.value,
    txErr: error.value,
  }))

  return {
    writeContract,
    data,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    tx,
  }
}
