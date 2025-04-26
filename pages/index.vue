<script setup lang="ts">
import PendingGamesTable from "~/components/index/PendingGamesTable.vue"
import SetupGameForm from "~/components/index/SetupGameForm.vue"

let userStore = useUserStore()
await userStore.fetch()
</script>

<template>
  <IndexHome v-if="!userStore.user" />
  <section v-else class="flex flex-col lg:flex-row">
    <div>
      <SetupGameForm class="my-3 ml-0 lg:mr-3 lg:w-80 lg:h-fit" />
      <IndexOngoingGamesList class="my-3 lg:mr-3 lg:w-80 lg:h-fit" />
    </div>

    <PendingGamesTable class="mt-3 grow" />
  </section>
</template>
