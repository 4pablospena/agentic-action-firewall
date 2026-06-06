import { describe, expect, it } from "vitest";
import { Firewall } from "../../src/firewall.js";
import {
  createFirewallConfig,
  generateTestKeypair,
  makeReadInbox,
  replaySession,
} from "../helpers/index.js";

describe("Layer 5 — Audit log and kill switch", () => {
  it("should append a signed audit entry on every evaluate()", async () => {
    const { privateKey } = generateTestKeypair();
    const firewall = new Firewall({
      ...createFirewallConfig(),
      signingKey: privateKey,
    });

    await firewall.evaluate(makeReadInbox());
    const entries = firewall.getAuditEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0]?.signature).toMatch(/^[0-9a-f]{128}$/);
    expect(entries[0]?.tool_call.arguments_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(entries[0]?.previous_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should maintain a valid hash chain across three consecutive decisions", async () => {
    const { privateKey } = generateTestKeypair();
    const firewall = new Firewall({
      ...createFirewallConfig(),
      signingKey: privateKey,
    });

    await replaySession(firewall, [
      makeReadInbox({ sessionId: "audit-chain-1" }),
      makeReadInbox({ sessionId: "audit-chain-1" }),
      makeReadInbox({ sessionId: "audit-chain-1" }),
    ]);

    expect(await firewall.verifyAuditChain()).toBe(true);
  });

  it("should fail verifyAuditChain when an entry is tampered", async () => {
    const { privateKey } = generateTestKeypair();
    const firewall = new Firewall({
      ...createFirewallConfig(),
      signingKey: privateKey,
    });

    await firewall.evaluate(makeReadInbox());
    const entries = firewall.getAuditEntries();
    if (entries[0]) {
      entries[0].decision.reason = "tampered";
    }

    expect(await firewall.verifyAuditChain()).toBe(false);
  });

  it("should block all subsequent evaluate() calls after activateKillSwitch(all)", async () => {
    const firewall = new Firewall(createFirewallConfig());

    await firewall.activateKillSwitch("all", "runaway behavior detected");
    const decision = await firewall.evaluate(makeReadInbox());

    expect(decision.outcome).toBe("block");
    expect(decision.byLayer).toBe(5);
    expect(decision.reason.toLowerCase()).toMatch(/kill|stopped/);
  });

  it("should block only the targeted agent when kill scope is agent:<id>", async () => {
    const firewall = new Firewall(createFirewallConfig());

    await firewall.activateKillSwitch("agent:runaway-bot", "agent runaway");
    const blocked = await firewall.evaluate(
      makeReadInbox({ agentId: "runaway-bot" }),
    );
    const allowed = await firewall.evaluate(
      makeReadInbox({ agentId: "other-bot" }),
    );

    expect(blocked.outcome).toBe("block");
    expect(blocked.byLayer).toBe(5);
    expect(allowed.outcome).toBe("allow");
  });

  it("should reject audit entries with invalid signatures", async () => {
    const { privateKey } = generateTestKeypair();
    const firewall = new Firewall({
      ...createFirewallConfig(),
      signingKey: privateKey,
    });

    await firewall.evaluate(makeReadInbox());
    const entries = firewall.getAuditEntries();
    if (entries[0]) {
      entries[0].signature = "0".repeat(128);
    }

    expect(await firewall.verifyAuditChain()).toBe(false);
  });
});
