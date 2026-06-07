import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "nuxt-auth-utils",
    "@agent-firewall/nuxt",
  ],
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
  },
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  agentFirewall: {
    apiUrl: process.env.NUXT_PUBLIC_AAF_API_URL ?? "",
    apiKey: process.env.NUXT_PUBLIC_AAF_API_KEY ?? "",
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD ?? "",
      cookie: {
        secure: process.env.NUXT_SESSION_COOKIE_SECURE === "true",
      },
    },
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET ?? "",
      },
    },
    databaseUrl: process.env.DATABASE_URL ?? "",
    devAuthBypass: process.env.NUXT_DEV_AUTH_BYPASS === "true",
    public: {
      appName: "Agent Action Firewall",
      devAuthEnabled: process.env.NUXT_DEV_AUTH_BYPASS === "true",
      oauthConfigured: Boolean(
        process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
        && process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
      ),
    },
  },
  nitro: {
    preset: "node-server",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
});
