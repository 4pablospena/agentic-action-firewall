import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Firewall } from "../src/firewall.js";
import {
  createFirewallConfig,
  makeDeleteBatch,
  makeReadInbox,
  makeSendEmail,
} from "./helpers/index.js";

describe("Firewall integration callbacks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T14:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should invoke onBlock with audit entry when kill switch blocks", async () => {
    const onBlock = vi.fn();
    const firewall = new Firewall({
      ...createFirewallConfig(),
      onBlock,
    });

    await firewall.activateKillSwitch("all", "runaway behavior detected");
    await firewall.evaluate(makeReadInbox());

    expect(onBlock).toHaveBeenCalledTimes(1);
    expect(onBlock.mock.calls[0]?.[0].decision.outcome).toBe("block");
    expect(onBlock.mock.calls[0]?.[0].auditEntry.signature).toMatch(/^[0-9a-f]{128}$/);
  });

  it("should invoke onApprovalNeeded for R3 pending with approvalId", async () => {
    const onApprovalNeeded = vi.fn();
    const firewall = new Firewall({
      ...createFirewallConfig(),
      onApprovalNeeded,
    });

    const decision = await firewall.evaluate(makeDeleteBatch(1));

    expect(decision.outcome).toBe("pending");
    expect(onApprovalNeeded).toHaveBeenCalledTimes(1);
    expect(onApprovalNeeded.mock.calls[0]?.[0].approvalId).toBe(decision.approvalId);
  });

  it("should auto-approve R3 when onApprovalNeeded returns approved", async () => {
    const firewall = new Firewall({
      ...createFirewallConfig(),
      onApprovalNeeded: async () => ({
        approved: true,
        approver: "callback-user",
      }),
    });

    const decision = await firewall.evaluate(makeDeleteBatch(1));

    expect(decision.outcome).toBe("allow");
    expect(decision.byLayer).toBe(4);
  });

  it("should ignore auto-approve return for R2 cancel window pending", async () => {
    const firewall = new Firewall({
      ...createFirewallConfig(),
      onApprovalNeeded: async () => ({
        approved: true,
        approver: "callback-user",
      }),
    });

    const decision = await firewall.evaluate(makeSendEmail());

    expect(decision.outcome).toBe("pending");
    expect(decision.riskTier).toBe("R2");
  });
});
