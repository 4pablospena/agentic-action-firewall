<script setup lang="ts">
definePageMeta({ auth: true });

const yaml = ref('version: "1"\nlearning_mode:\n  enabled: false\n');
const policies = ref<Array<{ id: string; version: string | null; validatedAt: string }>>([]);
const message = ref("");
const loading = ref(false);
const api = useDashboardFetch();

async function load() {
  const data = await api<{ policies: typeof policies.value }>("/api/v1/policies");
  policies.value = data.policies.map((p) => ({
    id: p.id,
    version: p.version,
    validatedAt: String(p.validatedAt),
  }));
}

async function upload() {
  loading.value = true;
  message.value = "";
  try {
    await api("/api/v1/policies", { method: "POST", body: { yaml: yaml.value } });
    message.value = "Policy validated and saved.";
    await load();
  } catch (error: unknown) {
    message.value = error instanceof Error ? error.message : "Upload failed";
  } finally {
    loading.value = false;
  }
}

await load();
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted-foreground">
      Upload and validate firewall.yml against the JSON Schema.
    </p>

    <Card>
      <CardContent class="space-y-4 pt-6">
        <Textarea v-model="yaml" :rows="16" class="font-mono text-sm" />
      </CardContent>
      <CardFooter>
        <Button :disabled="loading" @click="upload">
          {{ loading ? "Saving…" : "Validate & save" }}
        </Button>
      </CardFooter>
    </Card>

    <Alert v-if="message">
      <AlertTitle>{{ message }}</AlertTitle>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Saved policies</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2 text-sm">
          <li v-for="policy in policies" :key="policy.id">
            v{{ policy.version ?? "?" }} · {{ policy.validatedAt }}
          </li>
          <li v-if="policies.length === 0" class="text-muted-foreground">None yet.</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
