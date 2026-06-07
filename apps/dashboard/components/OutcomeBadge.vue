<script setup lang="ts">
import { badgeClass } from "~/components/ui/badge";
import { outcomeBadgeVariant } from "~/lib/outcome-badge";

const props = defineProps<{ outcome: string }>();

const variant = computed(() => outcomeBadgeVariant(props.outcome));
</script>

<template>
  <div :class="badgeClass(variant)">
    {{ outcome }}
  </div>
</template>
