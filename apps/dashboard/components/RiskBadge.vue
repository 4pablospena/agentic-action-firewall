<script setup lang="ts">
import { badgeClass } from "~/components/ui/badge";

const props = defineProps<{ tier: string }>();

const variant = computed(() => {
  switch (props.tier.toUpperCase()) {
    case "R1":
      return "secondary" as const;
    case "R2":
      return "default" as const;
    case "R3":
      return "warning" as const;
    case "R4":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
});
</script>

<template>
  <div :class="badgeClass(variant)">
    {{ tier.toUpperCase() }}
  </div>
</template>
