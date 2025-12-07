import type { Hex } from "viem"

export type TxStatus = "pending" | "success" | "failed"

export type RecentTransaction = {
  hash: Hex
  title: string
  status: TxStatus
  timestamp: number
}

export const useRecentTxStore = defineStore("recentTxStore", () => {
  const transactions = ref<RecentTransaction[]>([])

  const addTransaction = (tx: Omit<RecentTransaction, "timestamp">) => {
    transactions.value.unshift({
      ...tx,
      timestamp: Date.now(),
    })

    // Keep only the last 10 transactions
    if (transactions.value.length > 10) {
      transactions.value = transactions.value.slice(0, 10)
    }
  }

  const updateTransactionStatus = (hash: Hex, status: TxStatus) => {
    const tx = transactions.value.find((t) => t.hash === hash)
    if (tx) {
      tx.status = status
    }
  }

  const clearTransactions = () => {
    transactions.value = []
  }

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,
    clearTransactions,
  }
})
