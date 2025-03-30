<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types"

const config = useRuntimeConfig()

const registerUrl = config.public.apiUrl + "/auth/register"

const state = reactive({
  email: "",
  username: "",
  password: "",
  confirmedPassword: "",
})
const toast = useToast()

const userStore = useUserStore()

const tryingRegister = ref(false)
const tryRegister = async (event: FormSubmitEvent<any>) => {
  event.preventDefault()

  if (state.password !== state.confirmedPassword) {
    toast.add({ description: "Retype your passwords", color: "error", icon: "i-heroicons-x-circle" })
    return
  }

  tryingRegister.value = true
  try {
    const res = await $fetch.raw(registerUrl, {
      method: "POST",
      body: JSON.stringify({
        email: state.email,
        password: state.password,
        username: state.username,
      }),
      credentials: "include",
      ignoreResponseError: true,
    })

    if (res.status !== 200) {
      toast.add({
        title: "Registeration failed!",
        description: await res._data?.detail,
        color: "error",
        duration: 5000,
        icon: "i-heroicons-x-circle",
      })
      return
    }

    await userStore.fetch()
    await navigateTo("/")
  } catch (ex) {
    console.log("register exception:", ex)
    toast.add({ description: "Registration failed!", color: "error", icon: "i-heroicons-x-circle" })
  } finally {
    tryingRegister.value = false
  }
}
</script>

<template>
  <UForm @submit="tryRegister" :state="state" class="px-5 pt-3 pb-5">
    <UFormField label="Email:" name="email" class="mb-3">
      <UInput type="email" autofocus v-model="state.email" required :disabled="tryingRegister" />
    </UFormField>
    <UFormField label="Username:" name="username" class="mb-3">
      <UInput type="text" v-model="state.username" required :disabled="tryingRegister" />
    </UFormField>
    <UFormField label="Password:" name="password" class="mb-3">
      <UInput type="password" v-model="state.password" required :disabled="tryingRegister" />
    </UFormField>
    <UFormField label="Confirm Password:" name="confirmPassword" class="mb-5">
      <UInput type="password" v-model="state.confirmedPassword" required :disabled="tryingRegister" />
    </UFormField>

    <UButton type="submit" block size="lg" :loading="tryingRegister">Register</UButton>
  </UForm>
</template>

<style scoped></style>
