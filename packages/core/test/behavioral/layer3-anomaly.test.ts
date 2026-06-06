import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Firewall } from "../../src/firewall.js";
import {
  createFirewallConfig,
  langChainLoopSequence,
  makeDeleteBatch,
  makeSendEmail,
  makeSimilarSend,
  replaySession,
  spacedCalls,
  unitEmbedding,
} from "../helpers/index.js";

describe("Layer 3 — Behavioral anomaly detection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T14:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const firewall = new Firewall(createFirewallConfig());

  it("should block the OpenClaw scenario — 51 gmail.delete operations in 45s", async () => {
    const calls = spacedCalls((i) => makeDeleteBatch(1, { agentId: "inbox-organizer-bot" }), 51, 880);
    const results = await replaySession(firewall, calls);
    const blocked = results.find((r) => r.outcome === "block" && r.byLayer === 3);

    expect(blocked).toBeDefined();
    expect(blocked?.reason.toLowerCase()).toMatch(/mass|destructive|50|51/);
  });

  it("should throttle the LangChain $47K ping-pong loop — same sequence 4 times in 60s", async () => {
    const calls = langChainLoopSequence(4);
    const results = await replaySession(firewall, calls);
    const throttled = results.find((r) => r.outcome === "throttle" && r.byLayer === 3);

    expect(throttled).toBeDefined();
    expect(throttled?.throttleDelayMs).toBeGreaterThan(0);
    expect(throttled?.reason.toLowerCase()).toMatch(/loop|sequence|repeat/);
  });

  it("should throttle superhuman velocity — R2+ actions faster than 1 every 3s for over 1 minute", async () => {
    const calls = spacedCalls(() => makeSendEmail(), 25, 2000);
    vi.advanceTimersByTime(61_000);
    const results = await replaySession(firewall, calls);
    const throttled = results.find((r) => r.outcome === "throttle" && r.byLayer === 3);

    expect(throttled).toBeDefined();
    expect(throttled?.reason.toLowerCase()).toMatch(/velocity|speed|interval/);
  });

  it("should block repeated message when similarity exceeds 0.92 and recipients exceed 5", async () => {
    const embedding = unitEmbedding();
    const calls = Array.from({ length: 6 }, (_, i) =>
      makeSimilarSend(`recipient${i}@example.com`, embedding),
    );
    const results = await replaySession(firewall, calls);
    const blocked = results.find((r) => r.outcome === "block" && r.byLayer === 3);

    expect(blocked).toBeDefined();
    expect(blocked?.reason.toLowerCase()).toMatch(/similar|repetition|recipient/);
  });
});
