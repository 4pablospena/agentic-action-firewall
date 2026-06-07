<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DropdownMenuContent } from "reka-ui";
import { cn } from "~/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <DropdownMenuContent
    :class="cn(
      'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      props.class,
    )"
    align="end"
  >
    <slot />
  </DropdownMenuContent>
</template>
