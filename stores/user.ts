export type User = { id: string; userName: string; email: string; verifiedWallet: string }

export const useUserStore = defineStore("userStore", () => {
  const user = ref<User | null>(null)

  const fetch = async () => {
    try {
      const fetchResult = await $fetch<User>("/api/auth/user", {
        credentials: "include",
      })

      if (fetchResult) {
        user.value = Object.freeze(fetchResult)
      }
    } catch (error: any) {
      if (error.message?.includes("401")) {
        user.value = null
      }
    }
  }

  return { user, fetch }
})
