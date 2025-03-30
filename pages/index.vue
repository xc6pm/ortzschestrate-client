<script setup lang="ts">
import PendingGamesTable from "~/components/index/PendingGamesTable.vue"
import SetupGameForm from "~/components/index/SetupGameForm.vue"

let userStore = useUserStore()
await userStore.fetch()

if (!userStore.user) {
  await navigateTo("/login")
}
</script>

<template>
  <section v-if="!userStore.user">
    <h1></h1>
  </section>
  <section v-else class="flex flex-col lg:flex-row">
    <SetupGameForm class="my-3 ml-0 lg:mr-3 lg:w-80 lg:h-fit" />

    <PendingGamesTable class="mt-3 grow" />
  </section>
</template>
