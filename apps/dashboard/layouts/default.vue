<script setup lang="ts">
const route = useRoute();
const { loggedIn, user, clear } = useUserSession();

const nav = [
  { label: "Audit", to: "/audit", icon: "i-lucide-scroll-text" },
  { label: "Approvals", to: "/approvals", icon: "i-lucide-user-check" },
  { label: "Policies", to: "/policies", icon: "i-lucide-file-code-2" },
  { label: "Kill Switch", to: "/kill-switch", icon: "i-lucide-octagon-x" },
  { label: "Settings", to: "/settings", icon: "i-lucide-settings" },
];

async function logout() {
  await clear();
  await navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <header class="border-b border-gray-800 bg-gray-900/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="font-semibold tracking-tight text-white">
            AAF Dashboard
          </NuxtLink>
          <nav v-if="loggedIn" class="hidden items-center gap-1 md:flex">
            <UButton
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              :icon="item.icon"
              :variant="route.path.startsWith(item.to) ? 'soft' : 'ghost'"
              color="neutral"
              size="sm"
            >
              {{ item.label }}
            </UButton>
          </nav>
        </div>
        <div v-if="loggedIn" class="flex items-center gap-3 text-sm text-gray-300">
          <span>{{ user?.name ?? user?.email }}</span>
          <UButton variant="ghost" color="neutral" size="sm" @click="logout">
            Log out
          </UButton>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
