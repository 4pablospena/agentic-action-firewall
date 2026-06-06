<script setup lang="ts">
definePageMeta({ auth: false });

const config = useRuntimeConfig();
const { loggedIn } = useUserSession();

if (loggedIn.value) {
  await navigateTo("/audit");
}

const oauthConfigured = config.public.oauthConfigured;
const devAuthEnabled = config.public.devAuthEnabled;
</script>

<template>
  <UCard class="mx-auto max-w-md">
    <template #header>
      <h1 class="text-xl font-semibold">Sign in</h1>
    </template>

    <p class="mb-4 text-sm text-gray-400">
      Pro dashboard for audit log, approvals, and kill switch management.
    </p>

    <UAlert
      v-if="!oauthConfigured"
      color="warning"
      variant="soft"
      title="GitHub OAuth not configured"
      description="Set NUXT_OAUTH_GITHUB_CLIENT_ID and NUXT_OAUTH_GITHUB_CLIENT_SECRET in apps/dashboard/.env, or enable NUXT_DEV_AUTH_BYPASS=true for local dev."
      class="mb-4"
    />

    <div class="space-y-3">
      <UButton
        v-if="oauthConfigured"
        to="/auth/github"
        external
        icon="i-lucide-github"
        block
      >
        Continue with GitHub
      </UButton>

      <UButton
        v-if="devAuthEnabled"
        to="/auth/dev"
        external
        icon="i-lucide-terminal"
        color="neutral"
        variant="soft"
        block
      >
        Continue as Dev User
      </UButton>
    </div>
  </UCard>
</template>
