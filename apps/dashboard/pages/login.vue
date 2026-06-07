<script setup lang="ts">
import { LogIn, Terminal } from "@lucide/vue";

definePageMeta({ auth: false, layout: "auth" });

const config = useRuntimeConfig();
const { loggedIn } = useUserSession();

if (loggedIn.value) {
  await navigateTo("/audit");
}

const oauthConfigured = config.public.oauthConfigured;
const devAuthEnabled = config.public.devAuthEnabled;
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Sign in</CardTitle>
      <CardDescription>
        Pro dashboard for audit log, approvals, and kill switch management.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <Alert v-if="!oauthConfigured" variant="warning">
        <AlertTitle>GitHub OAuth not configured</AlertTitle>
        <AlertDescription>
          Set NUXT_OAUTH_GITHUB_CLIENT_ID and NUXT_OAUTH_GITHUB_CLIENT_SECRET in apps/dashboard/.env,
          or enable NUXT_DEV_AUTH_BYPASS=true for local dev.
        </AlertDescription>
      </Alert>

      <div class="space-y-3">
        <Button v-if="oauthConfigured" as-child class="w-full">
          <NuxtLink to="/auth/github" external>
            <LogIn class="h-4 w-4" />
            Continue with GitHub
          </NuxtLink>
        </Button>

        <Button v-if="devAuthEnabled" as-child variant="secondary" class="w-full">
          <NuxtLink to="/auth/dev" external>
            <Terminal class="h-4 w-4" />
            Continue as Dev User
          </NuxtLink>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
