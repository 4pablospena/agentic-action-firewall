import { describe, expect, it } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectAnomalyAsync } from "../../src/layers/anomaly.js";
import { SessionState } from "../../src/session-state.js";
import { loadEnforcementPolicy } from "../helpers/policy.js";

const modelPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../ml/fixtures/anomaly-v1.onnx",
);

describe("Layer 3 ONNX detector", () => {
  it("should block high-risk feature vectors when model is loaded", async () => {
    const policy = loadEnforcementPolicy();
    const state = new SessionState();

    const finalMs = Date.parse("2026-02-01T14:10:00.000Z");

    for (let i = 0; i < 55; i += 1) {
      const ts = finalMs - (55 - i) * 500;
      state.recordCall({
        call: {
          name: "gmail.delete",
          arguments: { batch_size: 1 },
          agentId: "agent-a",
          sessionId: "sess-1",
          timestamp: new Date(ts).toISOString(),
        },
        riskTier: "R3",
        timestampMs: ts,
        outcome: "allow",
      });
    }

    const decision = await detectAnomalyAsync(
      {
        name: "gmail.delete",
        arguments: { batch_size: 50 },
        agentId: "agent-a",
        sessionId: "sess-1",
        timestamp: new Date(finalMs).toISOString(),
      },
      policy,
      state,
      "R3",
      { onnxModelPath: modelPath },
    );

    expect(decision?.triggered).toBe(true);
    expect(decision?.outcome).toBe("block");
  });
});
