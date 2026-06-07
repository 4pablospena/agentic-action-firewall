<script setup lang="ts">
import type { BehaviorBaseline, ObservationEvent } from "@agent-firewall/core";

definePageMeta({ auth: true });

const route = useRoute();
const agentId = computed(() => String(route.params.agentId ?? ""));

interface ReviewResponse {
  baseline: {
    id: string;
    agentId: string;
    status: string;
    baseline: BehaviorBaseline;
  };
  narrative: string;
  outliers: Array<{
    event: ObservationEvent;
    score: number;
    reason: string;
  }>;
}

const review = ref<ReviewResponse | null>(null);
const loading = ref(true);
const message = ref("");
const api = useDashboardFetch();

const approvedTools = ref<Record<string, boolean>>({});
const thresholdOverrides = ref<Record<string, { perHour: number; minIntervalSeconds: number }>>({});
const outlierLabels = ref<Record<string, "normal" | "anomalous" | "template">>({});

function defaultPerHour(tool: BehaviorBaseline["tools"][string]): number {
  return Math.ceil(tool.calls_per_hour_p95 * 1.5);
}

function defaultMinInterval(tool: BehaviorBaseline["tools"][string]): number {
  return Math.max(1, Math.floor(tool.min_interval_observed_ms / 1000));
}

async function load() {
  loading.value = true;
  try {
    const data = await api<ReviewResponse>(`/api/v1/learning/baseline/${agentId.value}`);
    review.value = data;

    for (const [toolName, profile] of Object.entries(data.baseline.baseline.tools)) {
      approvedTools.value[toolName] = true;
      thresholdOverrides.value[toolName] = {
        perHour: defaultPerHour(profile),
        minIntervalSeconds: defaultMinInterval(profile),
      };
    }
  } finally {
    loading.value = false;
  }
}

async function saveOutlierLabels() {
  if (!review.value) {
    return;
  }

  const labels = Object.entries(outlierLabels.value).map(([eventId, label]) => ({
    eventId,
    label,
  }));

  if (labels.length === 0) {
    return;
  }

  await api(`/api/v1/learning/baseline/${review.value.baseline.id}/outliers`, {
    method: "POST",
    body: { labels },
  });
}

async function approveReview() {
  if (!review.value) {
    return;
  }

  message.value = "";
  try {
    await saveOutlierLabels();
    await api(`/api/v1/learning/baseline/${review.value.baseline.id}/approve`, {
      method: "POST",
      body: {
        approvedTools: approvedTools.value,
        thresholdOverrides: thresholdOverrides.value,
      },
    });
    message.value = "Review approved. Policy updated.";
    await load();
  } catch (error: unknown) {
    message.value = error instanceof Error ? error.message : "Approve failed";
  }
}

await load();
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">
        Review baseline for <span class="font-medium text-foreground">{{ agentId }}</span>
      </p>
      <Badge variant="secondary">{{ review?.baseline.status ?? "loading" }}</Badge>
    </div>

    <div v-if="loading" class="text-muted-foreground">Loading review…</div>

    <template v-else-if="review">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Section 1 — Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre class="whitespace-pre-wrap text-sm leading-relaxed">{{ review.narrative }}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Section 2 — Recommended policies</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <Card
            v-for="(profile, toolName) in review.baseline.baseline.tools"
            :key="toolName"
            class="border-dashed"
          >
            <CardContent class="space-y-4 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="font-medium">{{ toolName }}</p>
                <label class="flex items-center gap-2 text-sm">
                  <input v-model="approvedTools[toolName]" type="checkbox">
                  Approve
                </label>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ profile.usage_count }} observed calls · p95 {{ profile.calls_per_hour_p95 }}/hour
              </p>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <Label>Per hour limit</Label>
                  <Input
                    v-model.number="thresholdOverrides[toolName].perHour"
                    type="number"
                    min="1"
                  />
                </div>
                <div class="space-y-2">
                  <Label>Min interval (seconds)</Label>
                  <Input
                    v-model.number="thresholdOverrides[toolName].minIntervalSeconds"
                    type="number"
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Section 3 — Detected outliers</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <p v-if="review.outliers.length === 0" class="text-sm text-muted-foreground">
            No outliers detected in uploaded events.
          </p>
          <Card
            v-for="item in review.outliers"
            :key="item.event.event_id"
            class="border-dashed"
          >
            <CardContent class="space-y-3 p-4">
              <p class="text-sm">
                <span class="font-medium">{{ item.event.tool_name }}</span>
                · {{ item.event.timestamp }}
              </p>
              <p class="text-sm text-muted-foreground">{{ item.reason }}</p>
              <div class="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  :variant="outlierLabels[item.event.event_id] === 'normal' ? 'default' : 'outline'"
                  @click="outlierLabels[item.event.event_id] = 'normal'"
                >
                  Normal
                </Button>
                <Button
                  size="sm"
                  :variant="outlierLabels[item.event.event_id] === 'anomalous' ? 'default' : 'outline'"
                  @click="outlierLabels[item.event.event_id] = 'anomalous'"
                >
                  Anomalous
                </Button>
                <Button
                  size="sm"
                  :variant="outlierLabels[item.event.event_id] === 'template' ? 'default' : 'outline'"
                  @click="outlierLabels[item.event.event_id] = 'template'"
                >
                  Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div class="flex gap-3">
        <Button :disabled="review.baseline.status === 'approved'" @click="approveReview">
          Approve & activate policies
        </Button>
        <Button variant="outline" to="/learning">
          Upload another
        </Button>
      </div>
    </template>

    <Alert v-if="message">
      <AlertTitle>{{ message }}</AlertTitle>
    </Alert>
  </div>
</template>
