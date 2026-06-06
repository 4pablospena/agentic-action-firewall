import { describe, expect, it } from "vitest";
import { Firewall } from "../../src/firewall.js";
import {
  createFirewallConfig,
  makeDeleteBatch,
  makeReadInbox,
  makeSendEmail,
  makeToolCall,
} from "../helpers/index.js";

describe("Layer 1 — Intent classification", () => {
  const firewall = new Firewall(createFirewallConfig());

  it("should classify gmail.read as R1 and allow at layer 1", async () => {
    const decision = await firewall.evaluate(makeReadInbox());

    expect(decision.riskTier).toBe("R1");
    expect(decision.outcome).toBe("allow");
    expect(decision.byLayer).toBe(1);
  });

  it("should classify gmail.send as R2", async () => {
    const decision = await firewall.evaluate(makeSendEmail());

    expect(decision.riskTier).toBe("R2");
  });

  it("should classify gmail.delete with batch_size 1 as R3", async () => {
    const decision = await firewall.evaluate(makeDeleteBatch(1));

    expect(decision.riskTier).toBe("R3");
  });

  it("should escalate gmail.delete batch_size 50 to R4 — OpenClaw scenario", async () => {
    const decision = await firewall.evaluate(makeDeleteBatch(50));

    expect(decision.riskTier).toBe("R4");
  });

  it("should classify stripe.charge as R4", async () => {
    const decision = await firewall.evaluate(
      makeToolCall({
        name: "stripe.charge",
        arguments: { amount: 1000, currency: "usd" },
      }),
    );

    expect(decision.riskTier).toBe("R4");
  });

  it("should classify unknown.tool conservatively at R2 or higher when no static rule exists", async () => {
    const decision = await firewall.evaluate(
      makeToolCall({
        name: "unknown.tool",
        arguments: { action: "probe" },
      }),
    );

    expect(["R2", "R3", "R4"]).toContain(decision.riskTier);
  });
});
