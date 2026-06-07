import { type ChildProcess, spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Firewall } from "../../src/firewall.js";
import { createFirewallConfig, makeReadInbox } from "../helpers/index.js";

const redisUrl = process.env.REDIS_URL;
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const controlPlanePort = 9876;
const controlPlaneUrl = `http://127.0.0.1:${controlPlanePort}`;

async function waitForHealth(timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${controlPlaneUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Control plane did not become healthy in time");
}

describe.skipIf(!redisUrl)("Remote kill switch with Redis", () => {
  let processRef: ChildProcess | undefined;

  beforeAll(async () => {
    processRef = spawn(
      process.execPath,
      [join(repoRoot, "apps/control-plane/src/index.mjs")],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          REDIS_URL: redisUrl,
          PORT: String(controlPlanePort),
        },
        stdio: "pipe",
      },
    );

    await waitForHealth();
  });

  afterAll(async () => {
    if (!processRef) {
      return;
    }

    processRef.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      processRef?.once("exit", () => resolve());
      setTimeout(resolve, 2_000);
    });
  });

  it("should block evaluate() after POST /kill propagates through Redis", async () => {
    const killResponse = await fetch(`${controlPlaneUrl}/kill`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope: "all", reason: "remote integration test" }),
    });
    expect(killResponse.status).toBe(200);

    const firewall = new Firewall({
      ...createFirewallConfig(),
      controlPlaneUrl,
    });

    const decision = await firewall.evaluate(makeReadInbox());
    expect(decision.outcome).toBe("block");
    expect(decision.byLayer).toBe(5);
    expect(decision.reason.toLowerCase()).toMatch(/kill/);
  });
});
