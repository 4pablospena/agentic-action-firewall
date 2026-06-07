import { describe, expect, it } from "vitest";
import { createControlPlaneApp } from "../src/app.mjs";

describe("control plane kill API", () => {
  it("returns healthy status", async () => {
    const app = createControlPlaneApp("redis://127.0.0.1:1");
    const response = await app.request("http://localhost/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("requires scope and reason on POST /kill", async () => {
    const app = createControlPlaneApp("redis://127.0.0.1:1");
    const response = await app.request("http://localhost/kill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope: "all" }),
    });

    expect(response.status).toBe(400);
  });
});
