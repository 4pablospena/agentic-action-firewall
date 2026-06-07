<script setup lang="ts">
definePageMeta({ auth: true });

const agentId = ref("antonio-outreach-bot");
const payload = ref("");
const message = ref("");
const loading = ref(false);
const api = useDashboardFetch();

async function upload() {
  loading.value = true;
  message.value = "";
  try {
    const baseline = JSON.parse(payload.value);
    const result = await api<{ baseline: { id: string; agentId: string } }>(
      "/api/v1/learning/baseline",
      {
        method: "POST",
        body: { agentId: agentId.value, baseline },
      },
    );
    message.value = "Baseline uploaded.";
    await navigateTo(`/learning/review/${result.baseline.agentId}`);
  } catch (error: unknown) {
    message.value = error instanceof Error ? error.message : "Upload failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted-foreground">
      Opt-in upload of a Learning Mode baseline exported from <code>aaf learning export</code>.
    </p>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Upload baseline</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="agent-id">Agent ID</Label>
          <Input id="agent-id" v-model="agentId" />
        </div>
        <div class="space-y-2">
          <Label for="baseline-json">Baseline JSON</Label>
          <Textarea id="baseline-json" v-model="payload" :rows="18" class="font-mono text-sm" />
        </div>
      </CardContent>
      <CardFooter>
        <Button :disabled="loading || !payload" @click="upload">
          {{ loading ? "Uploading…" : "Upload & review" }}
        </Button>
      </CardFooter>
    </Card>

    <Alert v-if="message">
      <AlertTitle>{{ message }}</AlertTitle>
    </Alert>
  </div>
</template>
