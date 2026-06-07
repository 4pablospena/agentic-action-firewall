import { Hono } from "hono";

export function createControlPlaneApp(store, options = {}) {
  const app = new Hono();
  const authToken = options.authToken;

  app.get("/health", (c) => c.json({ ok: true }));

  const requireAuth = async (c, next) => {
    if (!authToken) {
      return next();
    }

    const header = c.req.header("authorization") ?? "";
    if (header !== `Bearer ${authToken}`) {
      return c.json({ error: "unauthorized" }, 401);
    }

    return next();
  };

  app.post("/kill", requireAuth, async (c) => {
    const body = await c.req.json();
    if (!body.scope || !body.reason) {
      return c.json({ error: "scope and reason are required" }, 400);
    }

    await store.set(body.scope, body.reason);
    return c.json({ ok: true, scope: body.scope });
  });

  app.get("/kill/check", async (c) => {
    const agentId = c.req.query("agentId") ?? "";
    const sessionId = c.req.query("sessionId") ?? "";

    const scopes = ["all", `agent:${agentId}`, `session:${sessionId}`];
    for (const scope of scopes) {
      const reason = await store.get(scope);
      if (reason) {
        return c.json({ killed: true, scope, reason });
      }
    }

    return c.json({ killed: false });
  });

  app.delete("/kill/:scope", requireAuth, async (c) => {
    const scope = c.req.param("scope");
    await store.del(scope);
    return c.json({ ok: true, scope });
  });

  return app;
}
