<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { alertClass, type AlertVariants } from ".";

const props = defineProps<{
  variant?: AlertVariants["variant"];
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div role="alert" :class="alertClass(variant, props.class)">
    <slot />
  </div>
</template>
