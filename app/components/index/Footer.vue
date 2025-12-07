<script setup lang="ts">
defineProps<{
  imgLoaded?: boolean
}>()
</script>

<template>
  <footer>
    <div class="py-6 text-center" :class="{ 'text-gray-300': imgLoaded }">
      <p>&copy; 2025 Nietzschess. All rights reserved.</p>
      <div class="flex justify-center gap-4 mt-2">
        <ULink to="/terms" :class="{ 'text-gray-300': imgLoaded }">Terms of Service</ULink>
        <ULink to="/privacy" :class="{ 'text-gray-300': imgLoaded }">Privacy Policy</ULink>
      </div>
      <div class="flex justify-center gap-4 mt-4">
        <ULink to="https://www.linkedin.com/in/hossein-ebrahimi-6a393b1b2/" target="_blank">
          <UIcon name="i-mdi-linkedin" class="w-6 h-6" :class="{ 'text-slate-300': imgLoaded }" />
        </ULink>
        <ULink to="https://github.com/xc6pm" target="_blank">
          <UIcon name="i-mdi-github" class="w-6 h-6" :class="{ 'text-slate-300': imgLoaded }" />
        </ULink>
        <ULink to="https://t.me/hcbrm" target="_blank">
          <UIcon name="i-mdi-telegram" class="w-6 h-6" :class="{ 'text-slate-300': imgLoaded }" />
        </ULink>
      </div>
    </div>
  </footer>
</template>
