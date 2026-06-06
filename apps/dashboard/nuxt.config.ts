import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "nuxt-auth-utils", "@agent-firewall/nuxt"],
  agentFirewall: {
    apiUrl: process.env.NUXT_PUBLIC_AAF_API_URL ?? "",
    apiKey: process.env.NUXT_PUBLIC_AAF_API_KEY ?? "",
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD ?? "",
    },
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET ?? "",
      },
    },
    databaseUrl: process.env.DATABASE_URL ?? "",
    public: {
      appName: "Agent Action Firewall",
    },
  },
  nitro: {
    preset: "node-server",
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
});
