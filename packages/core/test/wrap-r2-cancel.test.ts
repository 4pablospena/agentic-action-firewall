import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Firewall,
  FirewallBlockedError,
  guardToolExecution,
} from "../src/index.js";
import {
  createFirewallConfig,
  loadEnforcementPolicy,
  makeDeleteBatch,
  makeSendEmail,
} from "./helpers/index.js";

describe("Firewall.wrap R2 cancel window guard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T14:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should resolve guardToolExecution after cancel window with mocked evaluate", async () => {
    const evaluate = vi
      .fn()
      .mockResolvedValueOnce({
        outcome: "pending",
        riskTier: "R2",
        byLayer: 4,
        reason: "R2 cancel window started",
      })
      .mockResolvedValueOnce({
        outcome: "allow",
        riskTier: "R2",
        byLayer: 4,
        reason: "R2 cancel window elapsed",
      });
    const execute = vi.fn(async () => "ok");
    const call = makeSendEmail();

    const promise = guardToolExecution({ evaluate }, call, execute, {
      waitForR2CancelWindow: true,
      cancelWindowMs: 30_000,
    });

    await vi.advanceTimersByTimeAsync(31_000);
    await expect(promise).resolves.toBe("ok");
    expect(evaluate).toHaveBeenCalledTimes(2);
  });

  it("should allow second evaluate with the same ToolCall after cancel window", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const call = {
      name: "gmail.send",
      arguments: { to: "user@example.com" },
      agentId: "agent-a",
      sessionId: "sess-a",
      timestamp: new Date().toISOString(),
    };

    const first = await firewall.evaluate(call);
    vi.advanceTimersByTime(31_000);
    const second = await firewall.evaluate(call);

    expect(first.outcome).toBe("pending");
    expect(second.outcome).toBe("allow");
  });

  it("should execute wrapped gmail.send after R2 cancel window when waitForR2CancelWindow is enabled", async () => {
    vi.useRealTimers();
    const policy = loadEnforcementPolicy();
    policy.approval = {
      ...policy.approval,
      r2: { cancel_window_seconds: 1 },
    };
    const firewall = new Firewall({ policies: policy });
    const handler = vi.fn(async (_args: Record<string, unknown>) => "sent");

    const tools = firewall.wrap(
      [{ name: "gmail.send", execute: handler }],
      {
        context: { agentId: "agent-a", sessionId: "sess-a" },
        guard: { waitForR2CancelWindow: true, cancelWindowMs: 1_100 },
      },
    );

    await expect(tools[0]?.execute({ to: "user@example.com" })).resolves.toBe("sent");
    expect(handler).toHaveBeenCalledOnce();
  }, 10_000);

  it("should throw FirewallBlockedError for R2 pending without waitForR2CancelWindow", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const handler = vi.fn(async (_args: Record<string, unknown>) => "sent");

    const tools = firewall.wrap(
      [{ name: "gmail.send", execute: handler }],
      { context: { agentId: "agent-a", sessionId: "sess-a" } },
    );

    await expect(
      tools[0]?.execute({ to: "user@example.com" }),
    ).rejects.toThrow(FirewallBlockedError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("should throw FirewallBlockedError for R3 pending without inline approval", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const handler = vi.fn(async (_args: Record<string, unknown>) => "deleted");

    const tools = firewall.wrap(
      [{ name: "gmail.delete", execute: handler }],
      {
        context: { agentId: "agent-a", sessionId: "sess-a" },
        guard: { waitForR2CancelWindow: true },
      },
    );

    await expect(tools[0]?.execute({ batch_size: 1 })).rejects.toThrow(
      FirewallBlockedError,
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it("should not affect direct evaluate R3 pending behavior", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const decision = await firewall.evaluate(makeDeleteBatch(1));

    expect(decision.outcome).toBe("pending");
    expect(decision.riskTier).toBe("R3");
  });

  it("should not affect direct evaluate R2 cancel window behavior", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const pending = await firewall.evaluate(makeSendEmail());

    expect(pending.outcome).toBe("pending");

    vi.advanceTimersByTime(31_000);
    const afterWindow = await firewall.evaluate(makeSendEmail());

    expect(afterWindow.outcome).toBe("allow");
  });
});
