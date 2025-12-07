<script setup lang="ts">
import LoginForm from "~/components/auth/LoginForm.vue"
import RegisterForm from "~/components/auth/RegisterForm.vue"

const userStore = useUserStore()
await userStore.fetch()
if (userStore.user) navigateTo("/")

const tabs = [
  {
    key: "login",
    label: "Login",
    description: "Login to pre-existing account",
  },
  {
    key: "register",
    label: "Register",
    description: "Create a new account",
  },
]
</script>

<template>
  <UCard class="md:w-4/5 lg:w-2/3 xl:w-1/2 mx-auto mt-5 p-0" :ui="{ body: 'p-0 sm:p-0' }">
    <UTabs :items="tabs" class="w-full" :ui="{ list: 'rounded-t-lg' }">
      <template #content="{ item }">
        <LoginForm v-if="item.key === 'login'" />

        <RegisterForm v-else />
      </template>
    </UTabs>
  </UCard>
</template>

<style scoped></style>
