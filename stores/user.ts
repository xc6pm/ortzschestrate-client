export type User = { id: string; userName: string; email: string; verifiedWallet: string }

export const useUserStore = defineStore("userStore", () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)

  const fetch = async () => {
    try {
      const fetchResult = await $fetch<User>(apiUrl("/auth/user"), {
        credentials: "include",
      })

      if (fetchResult) {
        user.value = Object.freeze(fetchResult)
      }
    } catch (error) {
      if (error.message.includes("401")) {
        user.value = null
      }
    } finally {
      initialized.value = true
    }
  }

  return { user, fetch, initialized }
})
