<script setup lang="ts">
import {
  FileCode2,
  OctagonX,
  ScrollText,
  Settings,
  Shield,
  UserCheck,
} from "@lucide/vue";
import type { Component } from "vue";

export interface NavItem {
  label: string;
  to: string;
  icon: Component;
}

const route = useRoute();

const nav: NavItem[] = [
  { label: "Audit", to: "/audit", icon: ScrollText },
  { label: "Approvals", to: "/approvals", icon: UserCheck },
  { label: "Policies", to: "/policies", icon: FileCode2 },
  { label: "Kill Switch", to: "/kill-switch", icon: OctagonX },
  { label: "Settings", to: "/settings", icon: Settings },
];

function isActive(to: string) {
  return route.path.startsWith(to);
}
</script>

<template>
  <aside class="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
    <div class="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
      <Shield class="h-6 w-6 text-primary" />
      <NuxtLink to="/audit" class="font-semibold tracking-tight">
        AAF Dashboard
      </NuxtLink>
    </div>
    <nav class="flex-1 space-y-1 p-4">
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="isActive(item.to)
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>
