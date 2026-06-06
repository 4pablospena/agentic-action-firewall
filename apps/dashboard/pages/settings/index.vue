<script setup lang="ts">
definePageMeta({ auth: true });

const { user } = useUserSession();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Settings</h1>
      <p class="text-sm text-gray-400">Workspace and account configuration.</p>
    </div>

    <UCard>
      <dl class="grid gap-3 text-sm">
        <div><dt class="text-gray-400">Email</dt><dd>{{ user?.email }}</dd></div>
        <div><dt class="text-gray-400">Workspace ID</dt><dd class="font-mono">{{ user?.workspaceId }}</dd></div>
      </dl>
    </UCard>
  </div>
</template>
