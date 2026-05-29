<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui"
import { useUserStore } from "~/stores/user.client"

let userStore = useUserStore()
const { isMobile } = useIsMobile()

await userStore.fetch()

const tryLogout = async () => {
  await $fetch(apiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
  })

  await userStore.fetch()

  await navigateTo("login")
}

const dropDownItems = computed<DropdownMenuItem[][]>(() => {
  const logoutItem = {
    label: "log out",
    onSelect: tryLogout,
  }
  if (isMobile.value) {
    return [
      [
        {
          label: userStore.user?.userName,
        },
        logoutItem,
      ],
    ]
  } else {
    return [[logoutItem]]
  }
})
</script>

<template>
  <UDropdownMenu v-if="userStore.user" :items="dropDownItems" :popper="{ placement: 'bottom-end' }">
    <UButton
      :label="isMobile ? undefined : userStore.user.userName"
      icon="i-mdi-account-circle"
      color="tertiary"
      class="text-slate-200"
    />
  </UDropdownMenu>
  <UButton
    v-else
    :label="isMobile ? undefined : 'login'"
    icon="i-mdi-account-circle"
    color="tertiary"
    class="text-slate-300"
    to="/login"
  />
</template>
