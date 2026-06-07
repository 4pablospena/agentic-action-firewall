<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "reka-ui";
import { cn } from "~/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/80" />
    <DialogContent
      :class="cn(
        'fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col gap-4 border-l bg-background p-6 shadow-lg sm:max-w-xl',
        props.class,
      )"
    >
      <slot />
      <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
        <span class="sr-only">Close</span>
        <span aria-hidden="true" class="text-xl leading-none">&times;</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
