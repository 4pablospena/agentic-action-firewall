import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_WRAP_CONTEXT,
  Firewall,
  FirewallBlockedError,
} from "../src/index.js";
import { createFirewallConfig, makeReadInbox } from "./helpers/index.js";

describe("Firewall.wrap context", () => {
  it("should use legacy defaults when wrap options are omitted", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const tools = firewall.wrap([
      {
        name: "gmail.read",
        execute: async (_args: Record<string, unknown>) => "ok",
      },
    ]);

    await tools[0]?.execute({});
    const entry = firewall.getAuditEntries().at(-1);

    expect(entry?.agent_id).toBe(DEFAULT_WRAP_CONTEXT.agentId);
    expect(entry?.session_id).toBe(DEFAULT_WRAP_CONTEXT.sessionId);
  });

  it("should pass custom agentId and sessionId from wrap options to audit", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const tools = firewall.wrap(
      [
        {
          name: "gmail.read",
          execute: async (_args: Record<string, unknown>) => "ok",
        },
      ],
      {
        context: {
          agentId: "langchain-pipeline",
          sessionId: "sess_langchain_47k",
        },
      },
    );

    await tools[0]?.execute({});
    const entry = firewall.getAuditEntries().at(-1);

    expect(entry?.agent_id).toBe("langchain-pipeline");
    expect(entry?.session_id).toBe("sess_langchain_47k");
  });

  it("should not execute wrapped tool when kill switch blocks", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const handler = vi.fn(async (_args: Record<string, unknown>) => "executed");

    await firewall.activateKillSwitch("all", "stopped");
    const tools = firewall.wrap(
      [{ name: "gmail.read", execute: handler }],
      { context: { agentId: "bot-a", sessionId: "sess-a" } },
    );

    await expect(tools[0]?.execute({})).rejects.toThrow(FirewallBlockedError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("should allow evaluate via makeReadInbox unchanged", async () => {
    const firewall = new Firewall(createFirewallConfig());
    const decision = await firewall.evaluate(makeReadInbox());

    expect(decision.outcome).toBe("allow");
  });
});
