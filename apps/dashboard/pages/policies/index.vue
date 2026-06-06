<script setup lang="ts">
definePageMeta({ auth: true });

const yaml = ref('version: "1"\nlearning_mode:\n  enabled: false\n');
const policies = ref<Array<{ id: string; version: string | null; validatedAt: string }>>([]);
const message = ref("");
const loading = ref(false);

async function load() {
  const data = await $fetch<{ policies: typeof policies.value }>("/api/v1/policies");
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
    await $fetch("/api/v1/policies", { method: "POST", body: { yaml: yaml.value } });
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
    <div>
      <h1 class="text-2xl font-semibold">Policies</h1>
      <p class="text-sm text-gray-400">Upload and validate firewall.yml against the JSON Schema.</p>
    </div>

    <UCard>
      <UTextarea v-model="yaml" :rows="16" class="font-mono text-sm" />
      <template #footer>
        <UButton :loading="loading" @click="upload">Validate &amp; save</UButton>
      </template>
    </UCard>

    <UAlert v-if="message" :title="message" />

    <UCard>
      <template #header>Saved policies</template>
      <ul class="space-y-2 text-sm">
        <li v-for="policy in policies" :key="policy.id">
          v{{ policy.version ?? "?" }} · {{ policy.validatedAt }}
        </li>
        <li v-if="policies.length === 0" class="text-gray-400">None yet.</li>
      </ul>
    </UCard>
  </div>
</template>
