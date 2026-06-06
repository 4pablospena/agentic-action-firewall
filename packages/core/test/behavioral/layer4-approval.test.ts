import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Firewall } from "../../src/firewall.js";
import {
  createFirewallConfig,
  makeDeleteBatch,
  makeReadInbox,
  makeSendEmail,
  makeToolCall,
} from "../helpers/index.js";

describe("Layer 4 — Approval gate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T14:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const firewall = new Firewall(createFirewallConfig());

  it("should allow R1 gmail.read immediately without approver in audit", async () => {
    const decision = await firewall.evaluate(makeReadInbox());

    expect(decision.outcome).toBe("allow");
    expect(decision.riskTier).toBe("R1");
    const entry = firewall.getAuditEntries().at(-1);
    expect(entry?.approver).toBeUndefined();
  });

  it("should enter cancel window for R2 gmail.send then allow after 30s without cancel", async () => {
    const pending = await firewall.evaluate(makeSendEmail());

    expect(pending.outcome).toBe("pending");
    expect(pending.riskTier).toBe("R2");
    expect(pending.approvalId).toBeDefined();

    vi.advanceTimersByTime(31_000);
    const afterWindow = await firewall.evaluate(makeSendEmail());

    expect(afterWindow.outcome).toBe("allow");
  });

  it("should remain pending for R3 gmail.delete until explicit approve()", async () => {
    const pending = await firewall.evaluate(makeDeleteBatch(1));

    expect(pending.outcome).toBe("pending");
    expect(pending.riskTier).toBe("R3");
    expect(pending.approvalId).toBeDefined();

    const approved = await firewall.approve(pending.approvalId!, "user-123");

    expect(approved.outcome).toBe("allow");
    expect(approved.byLayer).toBe(4);
  });

  it("should reject R4 stripe.charge approval without MFA", async () => {
    const pending = await firewall.evaluate(
      makeToolCall({
        name: "stripe.charge",
        arguments: { amount: 5000, currency: "usd" },
      }),
    );

    expect(pending.outcome).toBe("pending");
    expect(pending.riskTier).toBe("R4");

    await expect(
      firewall.approve(pending.approvalId!, "user-123", { mfaVerified: false }),
    ).rejects.toThrow(/mfa/i);
  });

  it("should allow R4 stripe.charge after approve with MFA and record approver in audit", async () => {
    const pending = await firewall.evaluate(
      makeToolCall({
        name: "stripe.charge",
        arguments: { amount: 5000, currency: "usd" },
      }),
    );

    const approved = await firewall.approve(pending.approvalId!, "user-456", {
      mfaVerified: true,
    });

    expect(approved.outcome).toBe("allow");
    const entry = firewall.getAuditEntries().at(-1);
    expect(entry?.approver).toBe("user-456");
  });
});
