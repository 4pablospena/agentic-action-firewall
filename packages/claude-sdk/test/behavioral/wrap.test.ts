import { describe, expect, it, vi } from "vitest";
import { FirewallBlockedError } from "@agent-firewall/core";
import { wrapClaudeTools } from "../../src/index.js";
import { createTestFirewall, TEST_WRAP_CONTEXT } from "../helpers/firewall.js";

describe("wrapClaudeTools", () => {
  it("should execute handler when gmail.read is allowed", async () => {
    const firewall = createTestFirewall();
    const handler = vi.fn(async () => "inbox");

    const [tool] = wrapClaudeTools(
      firewall,
      [{ name: "gmail.read", handler }],
      TEST_WRAP_CONTEXT,
    );

    const result = await tool!.handler({ label: "INBOX" });

    expect(result).toBe("inbox");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("should throw FirewallBlockedError and skip handler when kill switch is active", async () => {
    const firewall = createTestFirewall();
    const handler = vi.fn(async () => "inbox");

    await firewall.activateKillSwitch("all", "runaway");

    const [tool] = wrapClaudeTools(
      firewall,
      [{ name: "gmail.read", handler }],
      TEST_WRAP_CONTEXT,
    );

    await expect(tool!.handler({ label: "INBOX" })).rejects.toThrow(
      FirewallBlockedError,
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it("should record wrap context agentId and sessionId in audit entries", async () => {
    const firewall = createTestFirewall();
    const handler = vi.fn(async () => "ok");

    const [tool] = wrapClaudeTools(
      firewall,
      [{ name: "gmail.read", handler }],
      TEST_WRAP_CONTEXT,
    );

    await tool!.handler({});

    const entry = firewall.getAuditEntries().at(-1);
    expect(entry?.agent_id).toBe(TEST_WRAP_CONTEXT.agentId);
    expect(entry?.session_id).toBe(TEST_WRAP_CONTEXT.sessionId);
  });
});
