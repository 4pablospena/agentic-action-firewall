import { describe, expect, it } from "vitest";
import { createControlPlaneApp } from "../src/app.mjs";
import { KillSwitchStore } from "../src/kill-switch-store.mjs";

class MemoryKillSwitchStore extends KillSwitchStore {
  #values = new Map();

  async get(scope) {
    return this.#values.get(scope) ?? null;
  }

  async set(scope, reason) {
    this.#values.set(scope, reason);
  }

  async del(scope) {
    this.#values.delete(scope);
  }
}

describe("control plane kill API", () => {
  it("returns healthy status", async () => {
    const app = createControlPlaneApp(new MemoryKillSwitchStore());
    const response = await app.request("http://localhost/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("requires scope and reason on POST /kill", async () => {
    const app = createControlPlaneApp(new MemoryKillSwitchStore());
    const response = await app.request("http://localhost/kill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope: "all" }),
    });

    expect(response.status).toBe(400);
  });
});
