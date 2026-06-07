<script setup lang="ts">
const route = useRoute();
const mobileNavOpen = ref(false);

const pageTitles: Record<string, string> = {
  "/audit": "Audit log",
  "/approvals": "Approvals",
  "/policies": "Policies",
  "/kill-switch": "Kill switch",
  "/settings": "Settings",
};

const pageTitle = computed(() => {
  const match = Object.entries(pageTitles).find(([path]) => route.path.startsWith(path));
  return match?.[1] ?? "AAF Dashboard";
});
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <div class="hidden md:flex">
      <AppSidebar />
    </div>

    <Sheet v-model:open="mobileNavOpen">
      <SheetContent class="w-64 p-0">
        <AppSidebar />
      </SheetContent>
    </Sheet>

    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader :title="pageTitle" @open-mobile-nav="mobileNavOpen = true" />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
