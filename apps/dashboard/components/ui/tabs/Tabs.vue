<script setup lang="ts">
import { TabsRoot } from "reka-ui";

const modelValue = defineModel<string>("modelValue");

const { defaultValue } = defineProps<{ defaultValue?: string }>();
</script>

<template>
  <TabsRoot v-model="modelValue" :default-value="defaultValue">
    <slot />
  </TabsRoot>
</template>
