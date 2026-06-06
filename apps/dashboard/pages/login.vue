<script setup lang="ts">
definePageMeta({ auth: false });

const { loggedIn } = useUserSession();

if (loggedIn.value) {
  await navigateTo("/audit");
}
</script>

<template>
  <UCard class="mx-auto max-w-md">
    <template #header>
      <h1 class="text-xl font-semibold">Sign in</h1>
    </template>
    <p class="mb-6 text-sm text-gray-400">
      Pro dashboard for audit log, approvals, and kill switch management.
    </p>
    <UButton
      to="/auth/github"
      external
      icon="i-lucide-github"
      block
    >
      Continue with GitHub
    </UButton>
  </UCard>
</template>
