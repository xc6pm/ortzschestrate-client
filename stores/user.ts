export type User = { id: string; userName: string; email: string; verifiedWallet: string }

export const useUserStore = defineStore("userStore", () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const toast = useToast()

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
      if (error.message.includes("401")) {
        toast.add({ title: "Unauthorized access. Please log in.", color: "error" })
      } else if (error.message.include("500")) {
        toast.add({
          title: "Unauthorized access. Please log in.",
          description: "Identity db connection failed",
          color: "error",
        })
      }
    } finally {
      initialized.value = true
    }
  }

  return { user, fetch, initialized }
})
