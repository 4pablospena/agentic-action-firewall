<script setup lang="ts">
definePageMeta({ auth: true });

const scope = ref("all");
const reason = ref("");
const events = ref<Array<{ id: string; scope: string; reason: string; createdAt: string }>>([]);
const loading = ref(false);
const api = useDashboardFetch();

async function load() {
  const data = await api<{ events: typeof events.value }>("/api/v1/kill");
  events.value = data.events.map((e) => ({
    ...e,
    createdAt: String(e.createdAt),
  }));
}

async function activate() {
  loading.value = true;
  try {
    await api("/api/v1/kill", {
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
    <p class="text-sm text-muted-foreground">
      Record kill switch activations. Distributed enforcement via control plane (Phase 1 slice 5).
    </p>

    <Card>
      <CardContent class="grid gap-4 pt-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="scope">Scope</Label>
          <Input id="scope" v-model="scope" placeholder="all | agent:id | session:id" />
        </div>
        <div class="space-y-2">
          <Label for="reason">Reason</Label>
          <Input id="reason" v-model="reason" placeholder="runaway behavior detected" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" :disabled="!reason || loading" @click="activate">
          {{ loading ? "Activating…" : "Activate kill switch" }}
        </Button>
      </CardFooter>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Recent events</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-3 text-sm">
          <li v-for="event in events" :key="event.id" class="border-b border-border pb-3 last:border-0 last:pb-0">
            <span class="font-medium">{{ event.scope }}</span>
            — {{ event.reason }}
            <span class="text-muted-foreground">({{ event.createdAt }})</span>
          </li>
          <li v-if="events.length === 0" class="text-muted-foreground">No kill switch events.</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
