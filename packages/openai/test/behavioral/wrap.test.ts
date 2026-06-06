import { describe, expect, it, vi } from "vitest";
import { FirewallBlockedError } from "@agent-firewall/core";
import { wrapOpenAITools } from "../../src/index.js";
import { createTestFirewall, TEST_WRAP_CONTEXT } from "../helpers/firewall.js";

describe("wrapOpenAITools", () => {
  it("should execute tool when gmail.read is allowed", async () => {
    const firewall = createTestFirewall();
    const handler = vi.fn(async () => "inbox");

    const [tool] = wrapOpenAITools(
      firewall,
      [{ name: "gmail.read", execute: handler }],
      TEST_WRAP_CONTEXT,
    );

    const result = await tool!.execute({ label: "INBOX" });

    expect(result).toBe("inbox");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("should throw FirewallBlockedError and skip execute when kill switch is active", async () => {
    const firewall = createTestFirewall();
    const handler = vi.fn(async () => "inbox");

    await firewall.activateKillSwitch("all", "runaway");

    const [tool] = wrapOpenAITools(
      firewall,
      [{ name: "gmail.read", execute: handler }],
      TEST_WRAP_CONTEXT,
    );

    await expect(tool!.execute({ label: "INBOX" })).rejects.toThrow(
      FirewallBlockedError,
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it("should record wrap context agentId and sessionId in audit entries", async () => {
    const firewall = createTestFirewall();
    const handler = vi.fn(async () => "ok");

    const [tool] = wrapOpenAITools(
      firewall,
      [{ name: "gmail.read", execute: handler }],
      TEST_WRAP_CONTEXT,
    );

    await tool!.execute({});

    const entry = firewall.getAuditEntries().at(-1);
    expect(entry?.agent_id).toBe(TEST_WRAP_CONTEXT.agentId);
    expect(entry?.session_id).toBe(TEST_WRAP_CONTEXT.sessionId);
  });
});
