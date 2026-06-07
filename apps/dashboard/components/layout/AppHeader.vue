<script setup lang="ts">
import { LogOut, Menu, User } from "@lucide/vue";

defineProps<{
  title?: string;
}>();

const emit = defineEmits<{ "open-mobile-nav": [] }>();

const { user, clear } = useUserSession();

async function logout() {
  await clear();
  await navigateTo("/login");
}
</script>

<template>
  <header class="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
    <Button variant="ghost" size="icon" class="md:hidden" aria-label="Open menu" @click="emit('open-mobile-nav')">
      <Menu class="h-5 w-5" />
    </Button>

    <div class="flex flex-1 flex-col">
      <h1 v-if="title" class="text-lg font-semibold leading-none">
        {{ title }}
      </h1>
    </div>

    <div class="flex items-center gap-2">
      <ColorModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" class="gap-2">
            <User class="h-4 w-4" />
            <span class="hidden max-w-[12rem] truncate sm:inline">
              {{ user?.name ?? user?.email }}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="logout">
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
