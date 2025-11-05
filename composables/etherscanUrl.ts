import { useAccount } from "@wagmi/vue"

export const useEtherscanUrlConstructor = () => {
  const account = useAccount()

  const urlToTx = (txHash: string) => {
    if (toValue(account.chainId) === 11155111) {
      return `https://sepolia.etherscan.io/tx/${txHash}`
    }

    console.error(`Etherscan url for a network with id ${toValue(account.chainId)} is not defined.`)
    return ""
  }

  return { urlToTx }
}
