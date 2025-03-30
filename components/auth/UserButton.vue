<script setup lang="ts">
import { useUserStore } from "~/stores/user"

let userStore = useUserStore()

await userStore.fetch()

const tryLogout = async () => {
  await $fetch(apiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
  })

  await userStore.fetch()

  await navigateTo("login")
}

const dropDownItems = [
  [
    {
      label: "log out",
      onSelect: tryLogout,
    },
  ],
]
</script>

<template>
  <UDropdownMenu v-if="userStore.user" :items="dropDownItems" :popper="{ placement: 'bottom-end' }">
    <UButton
      :label="userStore.user.userName"
      trailing-icon="i-heroicons-chevron-down-solid"
      color="tertiary"
      class="text-slate-200"
    />
  </UDropdownMenu>
  <UButton v-else label="Login" color="tertiary" class="text-slate-300" to="/login" />
</template>
