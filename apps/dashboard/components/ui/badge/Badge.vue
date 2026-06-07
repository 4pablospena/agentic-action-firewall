<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { badgeClass, type BadgeVariants } from ".";

const props = defineProps<{
  variant?: BadgeVariants["variant"];
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="badgeClass(variant, props.class)">
    <slot />
  </div>
</template>
