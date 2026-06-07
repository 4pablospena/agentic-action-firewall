import { Hono } from "hono";
import Redis from "ioredis";

export function createControlPlaneApp(redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379") {
  const app = new Hono();
  const redis = new Redis(redisUrl);

  function killKey(scope) {
    return `aaf:kill:${scope}`;
  }

  app.get("/health", (c) => c.json({ ok: true }));

  app.post("/kill", async (c) => {
    const body = await c.req.json();
    if (!body.scope || !body.reason) {
      return c.json({ error: "scope and reason are required" }, 400);
    }

    await redis.set(killKey(body.scope), body.reason);
    return c.json({ ok: true, scope: body.scope });
  });

  app.get("/kill/check", async (c) => {
    const agentId = c.req.query("agentId") ?? "";
    const sessionId = c.req.query("sessionId") ?? "";

    const scopes = ["all", `agent:${agentId}`, `session:${sessionId}`];
    for (const scope of scopes) {
      const reason = await redis.get(killKey(scope));
      if (reason) {
        return c.json({ killed: true, scope, reason });
      }
    }

    return c.json({ killed: false });
  });

  app.delete("/kill/:scope", async (c) => {
    const scope = c.req.param("scope");
    await redis.del(killKey(scope));
    return c.json({ ok: true, scope });
  });

  return app;
}
