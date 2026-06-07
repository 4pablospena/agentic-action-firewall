import { serve } from "@hono/node-server";
import { createControlPlaneApp } from "./app.mjs";

const app = createControlPlaneApp();
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`AAF control plane listening on http://localhost:${port}`);

export default app;
