import { defineConfig, devices } from "@playwright/test";

const previewEnv = {
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://aaf:aaf@localhost:5432/aaf_dashboard",
  NUXT_SESSION_PASSWORD:
    process.env.NUXT_SESSION_PASSWORD ??
    "playwright-session-password-min-32-chars",
  NUXT_OAUTH_GITHUB_CLIENT_ID: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID ?? "test",
  NUXT_OAUTH_GITHUB_CLIENT_SECRET:
    process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET ?? "test",
};

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm preview --port 3000",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: previewEnv,
  },
});
