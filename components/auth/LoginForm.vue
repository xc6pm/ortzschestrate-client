<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types"

const config = useRuntimeConfig()

const loginUrl = "/api/auth/login"

const state = reactive({
  emailOrUsername: "",
  password: "",
})
const toast = useToast()
const tryingLogin = ref(false)

const userStore = useUserStore()

const tryLogin = async (event: FormSubmitEvent<any>) => {
  event.preventDefault()

  tryingLogin.value = true
  const enteredValueIsEmail = isValidEmail(state.emailOrUsername)

  try {
    const res = await $fetch.raw(loginUrl, {
      method: "POST",
      body: JSON.stringify({
        password: state.password,
        email: enteredValueIsEmail ? state.emailOrUsername : "",
        username: !enteredValueIsEmail ? state.emailOrUsername : "",
      }),
      credentials: "include",
      ignoreResponseError: true,
    })

    if (res.status !== 200) {
      console.log("Login result:", res)
      toast.add({
        title: "Login failed!",
        description: await res._data?.detail,
        color: "error",
        duration: 5000,
        icon: "i-heroicons-x-circle",
      })
      return
    }

    await userStore.fetch()
    await navigateTo("/")
  } catch (ex: any) {
    toast.add({
      title: "Login failed!",
      color: "error",
      duration: 5000,
      icon: "i-heroicons-x-circle",
    })
  } finally {
    tryingLogin.value = false
  }
}

const { signIn } = await useAuth()

const tryGoogleLogin = async () => {
  await signIn()
}
</script>

<template>
  <UForm @submit="tryLogin" class="px-5 pt-3 py-5" :state="state">
    <UFormField label="Email or username:" name="emailOrUsername" class="mb-3">
      <UInput v-model="state.emailOrUsername" type="text" required autofocus :disabled="tryingLogin" />
    </UFormField>
    <UFormField label="Password:" name="password" class="mb-5">
      <UInput v-model="state.password" type="password" required :disabled="tryingLogin" />
    </UFormField>

    <UButton type="submit" block class="mb-3" :loading="tryingLogin" size="lg">Login</UButton>

    <UButton @click="tryGoogleLogin" color="neutral" variant="outline" block :disabled="tryingLogin" size="lg"
      >Login with Google</UButton
    >
  </UForm>
</template>

<style scoped></style>
