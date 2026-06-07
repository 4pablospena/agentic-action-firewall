<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue";

const colorMode = useColorMode();

function toggle() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <Button variant="ghost" size="icon" aria-label="Toggle theme" @click="toggle">
    <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </Button>
</template>
