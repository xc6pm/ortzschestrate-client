import { useAccount } from "@wagmi/vue"
import { getBlockNumber, readContract, watchContractEvent, type WatchContractEventReturnType } from "@wagmi/core"
import type { Deployment } from "~/types/Deployment"
import { config } from "~/web3/wagmiConfig"
import { formatEther, type Abi } from "viem"

const deploymentArtifact = import.meta.dev ? "/deployment/dev/ORTBet.json" : "/deployment/ORTBet.json"

export const useContractStateStore = defineStore("contractStateStore", () => {
  const deployment = ref<Deployment | null>(null)
  const account = useAccount()
  const stakesWei = ref(0n)
  const stakesEth = ref(0)
  let unwatchBalanceTrackingEvents: WatchContractEventReturnType[] = []

  watch(deployment, async (newValue, oldValue) => {
    if (newValue?.address) {
      await updateBalance()
      const balanceCheckedOnBlockNumber = await getBlockNumber(config)
      unwatchBalanceTrackingEvents.push(
        watchContractEvent(config, {
          strict: false,
          abi: newValue.abi,
          eventName: "StakesDeposited",
          args: {
            player: account.address.value,
          },
          syncConnectedChain: true,
          fromBlock: balanceCheckedOnBlockNumber + 1n,
          onLogs(logs) {
            console.log("deposit logs", logs)
            stakesWei.value += logs.reduce((cum, l) => cum + l.args!.amount, 0n)
            stakesEth.value = parseFloat(formatEther(stakesWei.value))
          },
        })
      )
      unwatchBalanceTrackingEvents.push(
        watchContractEvent(config, {
          abi: newValue.abi,
          eventName: "StakesWithdrawn",
          args: {
            player: account.address.value,
          },
          syncConnectedChain: true,
          fromBlock: balanceCheckedOnBlockNumber + 1n,
          onLogs(logs) {
            console.log("withdraw logs", logs)
            stakesWei.value -= logs.reduce((cum, l) => cum + l.args!.amount, 0n)
            stakesEth.value = parseFloat(formatEther(stakesWei.value))
          },
        })
      )
    } else {
      for (let unwatch of unwatchBalanceTrackingEvents) {
        unwatch()
      }
    }
  })

  const reload = async () => {
    const depl = await $fetch<Deployment>(deploymentArtifact)
    deployment.value = Object.freeze(depl)
    return deployment.value
  }

  const getDeployment = async () => {
    if (deployment.value) return Promise.resolve(deployment.value)

    await reload()
    if (!deployment.value) throw new Error("Deployment not found!!!")

    return deployment.value
  }

  const updateBalance = async () => {
    if (!account?.address?.value) {
      stakesWei.value = 0n
      stakesEth.value = 0
      return
    }

    const deployment = await getDeployment()

    const data = await readContract(config, {
      abi: deployment.abi as Abi,
      address: deployment.address,
      functionName: "getBalance",
      args: [account.address.value],
    })

    stakesWei.value = data as bigint
    stakesEth.value = parseFloat(formatEther(stakesWei.value))
    return { stakesWei: stakesWei.value, stakesEth: stakesEth.value }
  }

  return { getDeployment, reload, updateBalance, stakesWei, stakesEth, account }
})
