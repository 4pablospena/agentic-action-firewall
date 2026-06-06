<script setup lang="ts">
definePageMeta({ auth: true });

const scope = ref("all");
const reason = ref("");
const events = ref<Array<{ id: string; scope: string; reason: string; createdAt: string }>>([]);
const loading = ref(false);

async function load() {
  const data = await $fetch<{ events: typeof events.value }>("/api/v1/kill");
  events.value = data.events.map((e) => ({
    ...e,
    createdAt: String(e.createdAt),
  }));
}

async function activate() {
  loading.value = true;
  try {
    await $fetch("/api/v1/kill", {
      method: "POST",
      body: { scope: scope.value, reason: reason.value },
    });
    reason.value = "";
    await load();
  } finally {
    loading.value = false;
  }
}

await load();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Kill switch</h1>
      <p class="text-sm text-gray-400">
        Record kill switch activations. Distributed enforcement via control plane (Phase 1 slice 5).
      </p>
    </div>

    <UCard>
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Scope">
          <UInput v-model="scope" placeholder="all | agent:id | session:id" />
        </UFormField>
        <UFormField label="Reason">
          <UInput v-model="reason" placeholder="runaway behavior detected" />
        </UFormField>
      </div>
      <template #footer>
        <UButton color="error" :loading="loading" :disabled="!reason" @click="activate">
          Activate kill switch
        </UButton>
      </template>
    </UCard>

    <UCard>
      <template #header>Recent events</template>
      <ul class="space-y-2 text-sm">
        <li v-for="event in events" :key="event.id">
          <span class="font-medium">{{ event.scope }}</span> — {{ event.reason }}
          <span class="text-gray-500">({{ event.createdAt }})</span>
        </li>
        <li v-if="events.length === 0" class="text-gray-400">No kill switch events.</li>
      </ul>
    </UCard>
  </div>
</template>
