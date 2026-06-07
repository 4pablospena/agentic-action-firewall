<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { TabsContent } from "reka-ui";
import { cn } from "~/lib/utils";

const props = defineProps<{ value: string; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <TabsContent
    :value="value"
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      props.class,
    )"
  >
    <slot />
  </TabsContent>
</template>
