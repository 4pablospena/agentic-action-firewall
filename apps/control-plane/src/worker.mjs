import { createControlPlaneApp } from "./app.mjs";
import { createUpstashKillSwitchStore } from "./kill-switch-store.mjs";

export default {
  fetch(request, env) {
    const store = createUpstashKillSwitchStore(
      env.UPSTASH_REDIS_REST_URL,
      env.UPSTASH_REDIS_REST_TOKEN,
    );

    const app = createControlPlaneApp(store, {
      authToken: env.AAF_CONTROL_PLANE_TOKEN,
    });

    return app.fetch(request);
  },
};
