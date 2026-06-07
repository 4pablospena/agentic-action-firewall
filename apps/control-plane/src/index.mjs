import { serve } from "@hono/node-server";
import { createControlPlaneApp } from "./app.mjs";
import { createIoredisKillSwitchStore } from "./kill-switch-store.mjs";

const store = createIoredisKillSwitchStore(process.env.REDIS_URL ?? "redis://localhost:6379");
const app = createControlPlaneApp(store, {
  authToken: process.env.AAF_CONTROL_PLANE_TOKEN,
});
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`AAF control plane listening on http://localhost:${port}`);

export default app;
