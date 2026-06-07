import { describe, expect, it } from "vitest";
import { checkRemoteKillSwitch } from "../src/layers/kill-switch-remote.js";

describe("checkRemoteKillSwitch", () => {
  it("returns not killed when control plane URL is unset", async () => {
    const result = await checkRemoteKillSwitch(undefined, {
      name: "gmail.send",
      arguments: {},
      agentId: "agent-a",
      sessionId: "sess-1",
      timestamp: "2026-02-01T14:00:00.000Z",
    });

    expect(result.killed).toBe(false);
  });
});
