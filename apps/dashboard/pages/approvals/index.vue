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
    <p class="text-sm text-muted-foreground">
      Pending actions awaiting human review. Remote agent sync requires webhook/polling (Phase 1b).
    </p>

    <div v-if="loading" class="text-muted-foreground">Loading…</div>
    <div v-else-if="pending.length === 0" class="text-muted-foreground">No pending approvals.</div>
    <div v-else class="space-y-4">
      <Card v-for="item in pending" :key="item.id">
        <CardContent class="flex flex-wrap items-start justify-between gap-4 p-6">
          <div class="space-y-2">
            <p class="font-medium">{{ item.entry.tool_call.name }}</p>
            <p class="text-sm text-muted-foreground">{{ item.entry.decision.reason }}</p>
            <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{{ item.entry.agent_id }}</span>
              <RiskBadge :tier="item.entry.tool_call.risk_class" />
            </div>
          </div>
          <div class="flex gap-2">
            <Button @click="respond(item.id, true)">Approve</Button>
            <Button variant="destructive" @click="respond(item.id, false)">Deny</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
