<script setup lang="ts">
import type { AuditEntry } from "@agent-firewall/core";

definePageMeta({ auth: true });

interface PendingRow {
  id: string;
  entry: AuditEntry;
}

const pending = ref<PendingRow[]>([]);
const loading = ref(true);
const api = useDashboardFetch();

async function load() {
  loading.value = true;
  try {
    const data = await api<{ pending: PendingRow[] }>("/api/v1/approvals/pending");
    pending.value = data.pending;
  } finally {
    loading.value = false;
  }
}

async function respond(id: string, approved: boolean) {
  await api(`/api/v1/approvals/${id}/respond`, {
    method: "POST",
    body: { approved },
  });
  await load();
}

await load();
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Approvals</h1>
      <p class="text-sm text-gray-400">
        Pending actions awaiting human review. Remote agent sync requires webhook/polling (Phase 1b).
      </p>
    </div>

    <div v-if="loading" class="text-gray-400">Loading…</div>
    <div v-else-if="pending.length === 0" class="text-gray-400">No pending approvals.</div>
    <div v-else class="space-y-4">
      <UCard v-for="item in pending" :key="item.id">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-medium">{{ item.entry.tool_call.name }}</p>
            <p class="text-sm text-gray-400">{{ item.entry.decision.reason }}</p>
            <p class="text-xs text-gray-500">{{ item.entry.agent_id }} · {{ item.entry.tool_call.risk_class }}</p>
          </div>
          <div class="flex gap-2">
            <UButton color="success" @click="respond(item.id, true)">Approve</UButton>
            <UButton color="error" variant="soft" @click="respond(item.id, false)">Deny</UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
