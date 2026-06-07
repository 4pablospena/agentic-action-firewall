import { describe, expect, it } from "vitest";
import baselineFixture from "../../../../schemas/fixtures/baseline.example.json";
import {
  buildLearningNarrative,
  rankObservationOutliers,
} from "../../server/utils/learning-narrative";
import type { BehaviorBaseline, ObservationEvent } from "@agent-firewall/core";

describe("learning narrative", () => {
  it("should summarize baseline stats in template form", () => {
    const narrative = buildLearningNarrative(baselineFixture as unknown as BehaviorBaseline);
    expect(narrative).toContain("agent");
    expect(narrative).toContain("Confidence score");
  });

  it("should rank outlier events by heuristic score", () => {
    const events: ObservationEvent[] = [
      {
        event_id: "018f8b5a-7890-7000-8000-000000000001",
        agent_id: "agent-a",
        session_id: "sess-1",
        timestamp: "2026-02-01T14:00:00.000Z",
        tool_name: "gmail.send",
        tool_namespace: "gmail",
        tool_category: "messaging",
        time_since_last_action_ms: 100,
        time_since_session_start_ms: 100,
        session_action_count: 2,
        recipients: ["a", "b", "c", "d", "e", "f"],
        payload_hash: "0".repeat(64),
        payload_size_bytes: 20,
        batch_size: 15,
        succeeded: true,
        duration_ms: 1,
        external_response_hash: "0".repeat(64),
      },
    ];

    const outliers = rankObservationOutliers(events);
    expect(outliers).toHaveLength(1);
    expect(outliers[0]?.reason).toContain("batch size");
  });
});
