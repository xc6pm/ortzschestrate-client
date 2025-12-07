import { useAccount } from "@wagmi/vue"
import { isAddressEqual, zeroAddress, type Hex } from "viem"

export type User = { id: string; userName: string; email: string; verifiedWallet: Hex }

export const useUserStore = defineStore("userStore", () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const toast = useToast()
  const account = useAccount()
  const isWalletVerified = ref(false)

  watchEffect(() => {
    const status = account.status.value
    const address = account.address.value
    const wallet = user.value?.verifiedWallet

    isWalletVerified.value = status === "connected" && !!address && !!wallet && isAddressEqual(address, wallet as Hex)
  })

  const fetch = async () => {
    try {
      const fetchResult = await $fetch<User>(apiUrl("/auth/user"), {
        credentials: "include",
      })

      if (fetchResult) {
        user.value = Object.freeze(fetchResult)
      }
    } catch (error: any) {
      user.value = null
      if (error.message.includes("500")) {
        toast.add({
          title: "Identity db connection failed",
          description: "",
          color: "error",
        })
      }
    } finally {
      initialized.value = true
    }
  }

  return { user, fetch, initialized, isWalletVerified }
})
