import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createControlPlaneApp } from "../src/app.mjs";
import { createIoredisKillSwitchStore } from "../src/kill-switch-store.mjs";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
let store;
let app;

describe("control plane kill API with Redis", () => {
  beforeAll(() => {
    store = createIoredisKillSwitchStore(redisUrl);
    app = createControlPlaneApp(store);
  });

  afterAll(async () => {
    await store.del("all");
    await store.quit();
  });

  it("returns healthy status", async () => {
    const response = await app.request("http://localhost/health");
    expect(response.status).toBe(200);
  });

  it("propagates kill flags through Redis", async () => {
    const killResponse = await app.request("http://localhost/kill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope: "all", reason: "integration test" }),
    });
    expect(killResponse.status).toBe(200);

    const checkResponse = await app.request(
      "http://localhost/kill/check?agentId=agent-a&sessionId=sess-1",
    );
    expect(checkResponse.status).toBe(200);
    expect(await checkResponse.json()).toMatchObject({
      killed: true,
      scope: "all",
      reason: "integration test",
    });
  });
});
