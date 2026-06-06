<script setup lang="ts">
import type { AuditEntry } from "@agent-firewall/core";

definePageMeta({ auth: true });

const entries = ref<AuditEntry[]>([]);
const chainStatus = ref<{ valid: boolean | null; message?: string; entryCount?: number } | null>(null);
const loading = ref(true);
const selected = ref<AuditEntry | null>(null);

async function load() {
  loading.value = true;
  try {
    const [list, chain] = await Promise.all([
      $fetch<{ entries: AuditEntry[] }>("/api/v1/audit/entries"),
      $fetch<{ valid: boolean | null; message?: string; entryCount?: number }>(
        "/api/v1/audit/verify-chain",
      ),
    ]);
    entries.value = list.entries;
    chainStatus.value = chain;
  } finally {
    loading.value = false;
  }
}

await load();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Audit log</h1>
        <p class="text-sm text-gray-400">Immutable signed decisions from your agents.</p>
      </div>
      <UButton icon="i-lucide-refresh-cw" variant="soft" @click="load">Refresh</UButton>
    </div>

    <UAlert
      v-if="chainStatus"
      :color="chainStatus.valid === true ? 'success' : chainStatus.valid === false ? 'error' : 'warning'"
      :title="chainStatus.valid === true ? 'Chain verified' : chainStatus.valid === false ? 'Chain broken' : 'Verification unavailable'"
      :description="chainStatus.message ?? `${chainStatus.entryCount ?? 0} entries`"
    />

    <UCard>
      <div v-if="loading" class="text-gray-400">Loading…</div>
      <div v-else-if="entries.length === 0" class="text-gray-400">No audit entries yet.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-800 text-gray-400">
            <tr>
              <th class="px-3 py-2">Tool</th>
              <th class="px-3 py-2">Tier</th>
              <th class="px-3 py-2">Outcome</th>
              <th class="px-3 py-2">Layer</th>
              <th class="px-3 py-2">Agent</th>
              <th class="px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in entries"
              :key="entry.id"
              class="cursor-pointer border-b border-gray-900 hover:bg-gray-900/50"
              @click="selected = entry"
            >
              <td class="px-3 py-2">{{ entry.tool_call.name }}</td>
              <td class="px-3 py-2">{{ entry.tool_call.risk_class }}</td>
              <td class="px-3 py-2">{{ entry.decision.outcome }}</td>
              <td class="px-3 py-2">{{ entry.decision.by_layer }}</td>
              <td class="px-3 py-2">{{ entry.agent_id }}</td>
              <td class="px-3 py-2">{{ entry.timestamp }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UCard v-if="selected">
      <template #header>
        <h2 class="font-medium">Entry {{ selected.id }}</h2>
      </template>
      <dl class="grid gap-2 text-sm">
        <div><dt class="text-gray-400">Reason</dt><dd>{{ selected.decision.reason }}</dd></div>
        <div><dt class="text-gray-400">Session</dt><dd>{{ selected.session_id }}</dd></div>
        <div v-if="selected.approver"><dt class="text-gray-400">Approver</dt><dd>{{ selected.approver }}</dd></div>
        <div>
          <dt class="text-gray-400">Arguments</dt>
          <dd>
            <pre class="overflow-auto rounded bg-gray-900 p-2">{{ JSON.stringify(selected.tool_call.arguments, null, 2) }}</pre>
          </dd>
        </div>
      </dl>
    </UCard>
  </div>
</template>
