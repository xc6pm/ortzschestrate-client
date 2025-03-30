<script setup lang="ts">
const isBlurred = ref(false)
const imgLoaded = ref(false)

const blurBackgroundOnScroll = () => {
  isBlurred.value = window.scrollY > 1
}

onMounted(() => {
  window.addEventListener("scroll", blurBackgroundOnScroll)
})
onUnmounted(() => {
  window.removeEventListener("scroll", blurBackgroundOnScroll)
})
</script>

<template>
  <div :class="{ 'text-slate-300': imgLoaded }">
    <!-- Background Image -->
    <NuxtImg
      class="fixed top-0 left-0 w-full h-screen bg-cover bg-center transition-all duration-700"
      :class="{ 'blur-md': isBlurred }"
      style="z-index: -1"
      fit="inside"
      src="/img/home-bg.png"
      v-on:load="() => (imgLoaded = true)"
    />

    <!-- Hero Section -->
    <section>
      <div class="text-center py-20">
        <h1 class="text-4xl font-bold">Beyond Strategy. Beyond Luck.</h1>
        <p class="text-lg mt-2">Where philosophy meets the board, and every move is a wager.</p>
        <!-- <div class="mt-6 flex justify-center gap-4">
          <UButton color="primary" size="lg">Play Now</UButton>
          <UButton color="tertiary" variant="outline" size="lg">Learn More</UButton>
        </div> -->
      </div>
    </section>

    <!-- Features Section -->
    <section>
      <div class="grid md:grid-cols-3 gap-8 py-12">
        <UCard :class="{ 'bg-transparent': imgLoaded }">
          <template #header>Nietzschean Strategy 🧠</template>
          <p>Master the art of willpower, risk, and reward in a game that’s more than just chess.</p>
        </UCard>
        <UCard :class="{ 'bg-transparent': imgLoaded }">
          <template #header>Bet on Your Brilliance 💰</template>
          <p>Wager on your games and prove your dominance in a skill-based arena.</p>
        </UCard>
        <UCard :class="{ 'bg-transparent': imgLoaded }">
          <template #header>AI & Fair Play ⚖️</template>
          <p>A transparent, trust-based system powered by blockchain and AI analysis.</p>
        </UCard>
      </div>
    </section>

    <!-- Showcase Section -->
    <!-- <div>
      <div class="py-12 text-center">
        <h2 class="text-3xl font-semibold">Live Games & Top Players</h2>
        <p class="text-gray-500">See the highest-stake matches in action.</p>
        <ULink to="/games" class="mt-4 inline-block text-blue-500">View Games →</ULink>
      </div>
    </div> -->

    <!-- Call to Action -->
    <section>
      <div class="text-center py-16">
        <h2 class="text-2xl font-bold">Ready to stake your mind against the world?</h2>
        <div class="mt-6 flex justify-center gap-4">
          <UButton color="primary" size="lg" to="/login">Sign Up Now</UButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="py-6 text-center" :class="{ 'text-gray-300': imgLoaded }">
        <p>&copy; 2025 Nietzschess. All rights reserved.</p>
        <div class="flex justify-center gap-4 mt-2">
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
  </div>
</template>
