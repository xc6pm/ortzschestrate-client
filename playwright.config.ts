import { fileURLToPath } from "node:url"
import { defineConfig, devices } from "@playwright/test"
import type { ConfigOptions } from "@nuxt/test-utils/playwright"

export default defineConfig<ConfigOptions>({
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  testDir: "./test/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
})
