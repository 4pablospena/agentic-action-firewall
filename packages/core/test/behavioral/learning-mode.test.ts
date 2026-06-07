import { describe, expect, it } from "vitest";
import { validateObservationEvent } from "@agent-firewall/schemas/event";
import { validateBaseline } from "@agent-firewall/schemas/baseline";
import { Firewall } from "../../src/firewall.js";
import { createFirewallConfig, makeDeleteBatch } from "../helpers/index.js";

describe("Learning Mode — observation phase", () => {
  it("should not block destructive actions when learning mode is enabled", async () => {
    const firewall = new Firewall(
      createFirewallConfig({
        learningMode: true,
        policies: {
          version: "1",
          learning_mode: { enabled: true, observation_hours: 72 },
          anomaly_detection: {
            enabled: true,
            patterns: {
              mass_action: { enabled: true, threshold_per_minute: 5 },
            },
          },
        },
      }),
    );

    const decision = await firewall.evaluate(
      makeDeleteBatch(50, { agentId: "learning-agent" }),
    );

    expect(decision.outcome).toBe("allow");
    expect(decision.reason).toBe("Learning mode observation");
    expect(firewall.getObservationEvents("learning-agent")).toHaveLength(1);
  });

  it("should still enforce kill switch during learning mode", async () => {
    const firewall = new Firewall(
      createFirewallConfig({
        learningMode: true,
        policies: {
          version: "1",
          learning_mode: { enabled: true },
        },
      }),
    );

    await firewall.activateKillSwitch("all", "runaway");
    const decision = await firewall.evaluate(
      makeDeleteBatch(1, { agentId: "learning-agent" }),
    );

    expect(decision.outcome).toBe("block");
    expect(decision.byLayer).toBe(5);
  });

  it("should record observation events with canonical tool metadata", async () => {
    const firewall = new Firewall(
      createFirewallConfig({
        learningMode: true,
        policies: { version: "1", learning_mode: { enabled: true } },
      }),
    );

    await firewall.evaluate({
      name: "gmail.send",
      arguments: { to: "user@example.com", batch_size: 2 },
      agentId: "agent-a",
      sessionId: "sess-1",
      timestamp: "2026-02-01T14:00:00.000Z",
      recipients: ["user@example.com"],
    });

    const [event] = firewall.getObservationEvents("agent-a");
    expect(event?.tool_name).toBe("gmail.send");
    expect(event?.tool_namespace).toBe("gmail");
    expect(event?.batch_size).toBe(2);
    expect(event?.recipients).toHaveLength(1);
    expect(validateObservationEvent(event).valid).toBe(true);
  });
});

describe("Learning Mode — baseline export", () => {
  it("should build a baseline from recorded observation events", async () => {
    const firewall = new Firewall(
      createFirewallConfig({
        learningMode: true,
        policies: { version: "1", learning_mode: { enabled: true } },
      }),
    );

    for (let i = 0; i < 10; i += 1) {
      await firewall.evaluate({
        name: "gmail.send",
        arguments: { to: `user${i}@example.com` },
        agentId: "agent-a",
        sessionId: "sess-1",
        timestamp: new Date(Date.parse("2026-02-01T14:00:00.000Z") + i * 60_000).toISOString(),
        recipients: [`user${i}@example.com`],
      });
    }

    const baseline = firewall.exportBaseline("agent-a");
    expect(baseline.agent_id).toBe("agent-a");
    expect(baseline.observation_period.total_actions).toBe(10);
    expect(baseline.tools["gmail.send"]?.usage_count).toBe(10);
    expect(validateBaseline(baseline).valid).toBe(true);
    expect(firewall.exportBaselineYaml("agent-a")).toContain("learning_mode:");
  });
});
