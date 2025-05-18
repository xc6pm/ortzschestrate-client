export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  const userStore = useUserStore()

  if (!userStore.initialized) {
    await userStore.fetch()
  }

  if (!userStore.user) {
    return navigateTo("/login")
  }
})
