import { describe, expect, it } from "vitest";
import { extractAnomalyFeatures, featureVectorToArray } from "../src/layers/anomaly-features.js";
import { SessionState } from "../src/session-state.js";
import { loadEnforcementPolicy } from "./helpers/index.js";

describe("anomaly feature extractor", () => {
  it("should produce a fixed-size numeric vector", () => {
    const state = new SessionState();
    const features = extractAnomalyFeatures(
      {
        name: "gmail.send",
        arguments: { batch_size: 2 },
        agentId: "agent-a",
        sessionId: "sess-1",
        timestamp: "2026-02-01T14:00:00.000Z",
        recipients: ["a@example.com", "b@example.com"],
      },
      loadEnforcementPolicy(),
      state,
    );

    expect(featureVectorToArray(features)).toHaveLength(9);
    expect(features.batch_size).toBe(2);
  });
});
