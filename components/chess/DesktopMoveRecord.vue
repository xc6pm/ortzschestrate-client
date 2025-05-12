<script lang="ts" setup>
const props = defineProps<{
  movesPlayed: string[],
  showResignButton: boolean
}>()

const { movePairs } = useMovePairs(props.movesPlayed)

const connectionStore = useConnectionStore()

const resign = async () => {
  await connectionStore.invoke("resignShortGame")
}
</script>

<template>
  <UCard class="flex flex-col h-full" :ui="{ root: 'flex md:flex', body: 'flex-1' }">
    <table class="w-full text-left overflow-y-auto block table-fixed">
      <tbody class="block">
        <tr v-for="(pair, index) in movePairs" :key="index" class="flex flex-row">
          <td class="px-2 py-1 w-auto">{{ index + 1 }}</td>
          <td class="px-2 py-1 w-1/2">{{ pair.white }}</td>
          <td class="px-2 py-1 w-1/2">{{ pair.black }}</td>
        </tr>
      </tbody>
    </table>

    <template v-if="showResignButton" #footer>
      <UButton label="Resign" block variant="outline" color="neutral" class="end-0" @click="resign" />
    </template>
  </UCard>
</template>

<style scoped>
table {
  font-size: 14px;
}
</style>
