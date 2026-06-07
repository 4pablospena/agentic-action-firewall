<script setup lang="ts">
import type { AuditEntry } from "@agent-firewall/core";
import { RefreshCw } from "@lucide/vue";

definePageMeta({ auth: true });

const entries = ref<AuditEntry[]>([]);
const chainStatus = ref<{ valid: boolean | null; message?: string; entryCount?: number } | null>(null);
const loading = ref(true);
const sheetOpen = ref(false);
const selected = ref<AuditEntry | null>(null);
const api = useDashboardFetch();

async function load() {
  loading.value = true;
  try {
    const [list, chain] = await Promise.all([
      api<{ entries: AuditEntry[] }>("/api/v1/audit/entries"),
      api<{ valid: boolean | null; message?: string; entryCount?: number }>(
        "/api/v1/audit/verify-chain",
      ),
    ]);
    entries.value = list.entries;
    chainStatus.value = chain;
  } finally {
    loading.value = false;
  }
}

function openEntry(entry: AuditEntry) {
  selected.value = entry;
  sheetOpen.value = true;
}

const chainVariant = computed(() => {
  if (!chainStatus.value) return "default";
  if (chainStatus.value.valid === true) return "success";
  if (chainStatus.value.valid === false) return "destructive";
  return "warning";
});

const chainTitle = computed(() => {
  if (!chainStatus.value) return "";
  if (chainStatus.value.valid === true) return "Chain verified";
  if (chainStatus.value.valid === false) return "Chain broken";
  return "Verification unavailable";
});

await load();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm text-muted-foreground">
          Immutable signed decisions from your agents.
        </p>
      </div>
      <Button variant="outline" size="sm" @click="load">
        <RefreshCw class="h-4 w-4" />
        Refresh
      </Button>
    </div>

    <Alert v-if="chainStatus" :variant="chainVariant">
      <AlertTitle>{{ chainTitle }}</AlertTitle>
      <AlertDescription>
        {{ chainStatus.message ?? `${chainStatus.entryCount ?? 0} entries` }}
      </AlertDescription>
    </Alert>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="p-6 text-muted-foreground">Loading…</div>
        <div v-else-if="entries.length === 0" class="p-6 text-muted-foreground">
          No audit entries yet.
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Layer</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="entry in entries"
              :key="entry.id"
              class="cursor-pointer"
              @click="openEntry(entry)"
            >
              <TableCell class="font-medium">{{ entry.tool_call.name }}</TableCell>
              <TableCell>
                <RiskBadge :tier="entry.tool_call.risk_class" />
              </TableCell>
              <TableCell>
                <OutcomeBadge :outcome="entry.decision.outcome" />
              </TableCell>
              <TableCell>{{ entry.decision.by_layer }}</TableCell>
              <TableCell>{{ entry.agent_id }}</TableCell>
              <TableCell class="text-muted-foreground">{{ entry.timestamp }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Sheet v-model:open="sheetOpen">
      <SheetContent v-if="selected">
        <SheetTitle>Entry {{ selected.id }}</SheetTitle>
        <SheetDescription>Audit decision details</SheetDescription>
        <Separator class="my-4" />
        <dl class="grid gap-4 text-sm">
          <div>
            <dt class="text-muted-foreground">Reason</dt>
            <dd>{{ selected.decision.reason }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Session</dt>
            <dd>{{ selected.session_id }}</dd>
          </div>
          <div v-if="selected.approver">
            <dt class="text-muted-foreground">Approver</dt>
            <dd>{{ selected.approver }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Arguments</dt>
            <dd>
              <pre class="mt-1 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{{ JSON.stringify(selected.tool_call.arguments, null, 2) }}</pre>
            </dd>
          </div>
        </dl>
      </SheetContent>
    </Sheet>
  </div>
</template>
