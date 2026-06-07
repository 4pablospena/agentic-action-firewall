import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Firewall } from "../../src/firewall.js";
import { SqliteObservationStore } from "../../src/learning/sqlite-observation-store.js";
import { createFirewallConfig } from "../helpers/index.js";

describe("Learning Mode — SQLite persistence", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function tempDbPath(): string {
    const dir = mkdtempSync(join(tmpdir(), "aaf-obs-"));
    tempDirs.push(dir);
    return join(dir, "observations.db");
  }

  it("should persist observation events across Firewall instances", async () => {
    const dbPath = tempDbPath();
    const config = createFirewallConfig({
      learningMode: true,
      policies: { version: "1", learning_mode: { enabled: true } },
      observationDbPath: dbPath,
    });

    const first = new Firewall(config);
    await first.evaluate({
      name: "gmail.send",
      arguments: { to: "user@example.com" },
      agentId: "persist-agent",
      sessionId: "sess-1",
      timestamp: "2026-02-01T14:00:00.000Z",
      recipients: ["user@example.com"],
    });

    expect(first.getObservationEvents("persist-agent")).toHaveLength(1);

    const second = new Firewall(config);
    expect(second.getObservationEvents("persist-agent")).toHaveLength(1);
    expect(second.exportBaseline("persist-agent").observation_period.total_actions).toBe(1);
  });

  it("should purge events older than the retention window", () => {
    const dbPath = tempDbPath();
    const store = new SqliteObservationStore(dbPath);

    store.append({
      event_id: "018f8b5a-7890-7000-8000-000000000001",
      agent_id: "agent-a",
      session_id: "sess-1",
      timestamp: "2020-01-01T00:00:00.000Z",
      tool_name: "gmail.send",
      tool_namespace: "gmail",
      tool_category: "messaging",
      time_since_last_action_ms: 0,
      time_since_session_start_ms: 0,
      session_action_count: 1,
      recipients: [],
      payload_hash: "0".repeat(64),
      payload_size_bytes: 1,
      batch_size: 1,
      succeeded: true,
      duration_ms: 0,
      external_response_hash: "0".repeat(64),
    });

    store.append({
      event_id: "018f8b5a-7890-7000-8000-000000000002",
      agent_id: "agent-a",
      session_id: "sess-1",
      timestamp: new Date().toISOString(),
      tool_name: "gmail.send",
      tool_namespace: "gmail",
      tool_category: "messaging",
      time_since_last_action_ms: 1000,
      time_since_session_start_ms: 1000,
      session_action_count: 2,
      recipients: [],
      payload_hash: "0".repeat(64),
      payload_size_bytes: 1,
      batch_size: 1,
      succeeded: true,
      duration_ms: 0,
      external_response_hash: "0".repeat(64),
    });

    expect(store.count("agent-a")).toBe(2);
    store.purgeOlderThan(7);
    expect(store.count("agent-a")).toBe(1);
  });
});
