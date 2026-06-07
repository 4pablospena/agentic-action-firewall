import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { ObservationEvent } from "../generated/event.js";
import type { ObservationStore } from "./observation-store.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS observation_events (
  event_id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  payload TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_observation_agent_ts
  ON observation_events (agent_id, timestamp);
`;

function ensureParentDir(dbPath: string): void {
  const dir = dirname(dbPath);
  if (dir && dir !== ".") {
    mkdirSync(dir, { recursive: true });
  }
}

export class SqliteObservationStore implements ObservationStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    ensureParentDir(dbPath);
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(SCHEMA);
  }

  append(event: ObservationEvent): void {
    this.db
      .prepare(
        `INSERT INTO observation_events (event_id, agent_id, timestamp, payload)
         VALUES (@event_id, @agent_id, @timestamp, @payload)
         ON CONFLICT(event_id) DO NOTHING`,
      )
      .run({
        event_id: event.event_id,
        agent_id: event.agent_id,
        timestamp: event.timestamp,
        payload: JSON.stringify(event),
      });
  }

  list(agentId?: string): ObservationEvent[] {
    const rows = agentId
      ? this.db
          .prepare(
            `SELECT payload FROM observation_events
             WHERE agent_id = ?
             ORDER BY timestamp ASC`,
          )
          .all(agentId)
      : this.db
          .prepare(
            `SELECT payload FROM observation_events
             ORDER BY timestamp ASC`,
          )
          .all();

    return rows.map((row) => JSON.parse((row as { payload: string }).payload) as ObservationEvent);
  }

  count(agentId?: string): number {
    if (!agentId) {
      const row = this.db
        .prepare(`SELECT COUNT(*) AS count FROM observation_events`)
        .get() as { count: number };
      return row.count;
    }

    const row = this.db
      .prepare(`SELECT COUNT(*) AS count FROM observation_events WHERE agent_id = ?`)
      .get(agentId) as { count: number };
    return row.count;
  }

  purgeOlderThan(days: number): number {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const result = this.db
      .prepare(`DELETE FROM observation_events WHERE timestamp < ?`)
      .run(cutoff);
    return result.changes;
  }

  close(): void {
    this.db.close();
  }
}
