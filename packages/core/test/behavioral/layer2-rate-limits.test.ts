import { describe, expect, it } from "vitest";
import { Firewall } from "../../src/firewall.js";
import {
  createFirewallConfig,
  langChainLoopSequence,
  makeSendEmail,
  replaySession,
  spacedCalls,
} from "../helpers/index.js";

describe("Layer 2 — Rate limits and budget", () => {
  const firewall = new Firewall(createFirewallConfig());

  it("should block the 21st gmail.send in one hour — per_hour limit 20", async () => {
    const calls = spacedCalls(() => makeSendEmail(), 21, 60_000);
    const results = await replaySession(firewall, calls);
    const last = results.at(-1);

    expect(last?.outcome).toBe("block");
    expect(last?.byLayer).toBe(2);
    expect(last?.reason.toLowerCase()).toMatch(/per_hour|hour|rate/);
  });

  it("should block two gmail.send calls to the same recipient within min_interval 6s", async () => {
    const recipient = "same@example.com";
    const calls = spacedCalls(
      () => makeSendEmail({ recipients: [recipient], arguments: { to: recipient } }),
      2,
      2000,
    );
    const results = await replaySession(firewall, calls);
    const last = results.at(-1);

    expect(last?.outcome).toBe("block");
    expect(last?.byLayer).toBe(2);
    expect(last?.reason.toLowerCase()).toMatch(/interval|rate|velocity/);
  });

  it("should block when session cost exceeds $5 — LangChain $47K cost cap", async () => {
    const calls = Array.from({ length: 12 }, (_, i) =>
      makeSendEmail({
        costUsd: 0.5,
        timestamp: new Date(`2026-02-01T14:${String(i).padStart(2, "0")}:00.000Z`).toISOString(),
      }),
    );
    const results = await replaySession(firewall, calls);
    const blocked = results.find((r) => r.outcome === "block" && r.byLayer === 2);

    expect(blocked).toBeDefined();
    expect(blocked?.reason.toLowerCase()).toMatch(/cost|budget|\$/);
  });

  it("should allow Analyzer↔Verifier loop steps that stay under rate limits — LangChain is Layer 3", async () => {
    const calls = langChainLoopSequence(2);
    const results = await replaySession(firewall, calls);

    expect(results.every((r) => r.outcome === "allow" || r.outcome === "throttle")).toBe(true);
    expect(results.some((r) => r.byLayer === 2 && r.outcome === "block")).toBe(false);
  });
});
