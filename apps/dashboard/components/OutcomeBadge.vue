<script setup lang="ts">
import { badgeClass } from "~/components/ui/badge";

const props = defineProps<{ outcome: string }>();

const variant = computed(() => {
  switch (props.outcome.toLowerCase()) {
    case "allowed":
      return "default" as const;
    case "blocked":
      return "destructive" as const;
    case "pending":
      return "warning" as const;
    default:
      return "outline" as const;
  }
});
</script>

<template>
  <div :class="badgeClass(variant)">
    {{ outcome }}
  </div>
</template>
