import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runLearningExport, runLearningStatus } from "../src/commands/learning.js";

describe("aaf learning commands", () => {
  it("reports observation status for an agent", () => {
    const dir = mkdtempSync(join(tmpdir(), "aaf-learning-"));
    const inputPath = join(dir, "events.json");
    writeFileSync(
      inputPath,
      JSON.stringify([
        {
          event_id: "018f8b5a-7890-7000-8000-000000000001",
          agent_id: "agent-a",
          session_id: "sess-1",
          timestamp: "2026-02-01T14:00:00.000Z",
          tool_name: "gmail.send",
          tool_namespace: "gmail",
          tool_category: "messaging",
          time_since_last_action_ms: 0,
          time_since_session_start_ms: 0,
          session_action_count: 1,
          recipients: [],
          payload_hash: "0".repeat(64),
          payload_size_bytes: 10,
          batch_size: 1,
          succeeded: true,
          duration_ms: 0,
          external_response_hash: "0".repeat(64),
        },
      ]),
      "utf8",
    );

    expect(runLearningStatus(["--agent", "agent-a", "--input", inputPath])).toBe(0);
  });

  it("exports baseline JSON and YAML snippet", () => {
    const dir = mkdtempSync(join(tmpdir(), "aaf-learning-"));
    const inputPath = join(dir, "events.json");
    const outputPath = join(dir, "baseline.txt");
    writeFileSync(
      inputPath,
      JSON.stringify([
        {
          event_id: "018f8b5a-7890-7000-8000-000000000001",
          agent_id: "agent-a",
          session_id: "sess-1",
          timestamp: "2026-02-01T14:00:00.000Z",
          tool_name: "gmail.send",
          tool_namespace: "gmail",
          tool_category: "messaging",
          time_since_last_action_ms: 0,
          time_since_session_start_ms: 0,
          session_action_count: 1,
          recipients: [],
          payload_hash: "0".repeat(64),
          payload_size_bytes: 10,
          batch_size: 1,
          succeeded: true,
          duration_ms: 0,
          external_response_hash: "0".repeat(64),
        },
      ]),
      "utf8",
    );

    expect(
      runLearningExport(["--agent", "agent-a", "--input", inputPath, "--output", outputPath]),
    ).toBe(0);
  });
});
