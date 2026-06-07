import { randomBytes } from "@noble/hashes/utils";
import type { ObservationEvent } from "../generated/event.js";
import type { ToolCall } from "../types.js";
import { sha256Hex } from "../utils/crypto.js";
import type { ObservationStore } from "./observation-store.js";

const ZERO_HASH = "0".repeat(64);

function inferCategory(namespace: string): ObservationEvent["tool_category"] {
  if (["gmail", "slack", "twilio", "resend"].includes(namespace)) {
    return "messaging";
  }
  if (["linkedin", "twitter"].includes(namespace)) {
    return "social";
  }
  if (["stripe", "paypal"].includes(namespace)) {
    return "payment";
  }
  if (["s3", "filesystem"].includes(namespace)) {
    return "storage";
  }
  if (["shell", "docker"].includes(namespace)) {
    return "compute";
  }
  if (["crm", "db"].includes(namespace)) {
    return "data";
  }
  return "other";
}

function batchSize(args: Record<string, unknown>): number {
  const value = args.batch_size;
  return typeof value === "number" && value >= 1 ? value : 1;
}

let eventSequence = 0;

function generateEventId(): string {
  eventSequence += 1;
  const suffix = randomBytes(6);
  const tail = `${eventSequence.toString(16).padStart(4, "0")}${[...suffix].map((b) => b.toString(16).padStart(2, "0")).join("")}`.slice(0, 12);
  return `018f8b5a-7890-7000-8000-${tail.padEnd(12, "0")}`;
}

export class ObservationRecorder {
  private readonly sessionStarts = new Map<string, number>();
  private readonly lastActionMs = new Map<string, number>();
  private readonly sessionCounts = new Map<string, number>();

  constructor(private readonly store: ObservationStore) {}

  record(call: ToolCall, durationMs = 0): ObservationEvent {
    const sessionKey = `${call.agentId}:${call.sessionId}`;
    const nowMs = new Date(call.timestamp).getTime();

    if (!this.sessionStarts.has(sessionKey)) {
      this.sessionStarts.set(sessionKey, nowMs);
    }

    const prevMs = this.lastActionMs.get(sessionKey);
    const sessionCount = (this.sessionCounts.get(sessionKey) ?? 0) + 1;
    this.sessionCounts.set(sessionKey, sessionCount);
    this.lastActionMs.set(sessionKey, nowMs);

    const [namespace] = call.name.split(".");
    const payloadJson = JSON.stringify(call.arguments);
    const recipients = (call.recipients ?? []).map((recipient) => sha256Hex(recipient));

    const base = {
      event_id: generateEventId(),
      agent_id: call.agentId,
      session_id: call.sessionId,
      timestamp: call.timestamp,
      tool_name: call.name,
      tool_namespace: namespace ?? call.name,
      tool_category: inferCategory(namespace ?? "other"),
      time_since_last_action_ms: prevMs === undefined ? 0 : Math.max(0, nowMs - prevMs),
      time_since_session_start_ms: Math.max(0, nowMs - (this.sessionStarts.get(sessionKey) ?? nowMs)),
      session_action_count: sessionCount,
      recipients,
      payload_hash: sha256Hex(payloadJson),
      payload_size_bytes: payloadJson.length,
      batch_size: batchSize(call.arguments),
      succeeded: true,
      duration_ms: durationMs,
      external_response_hash: ZERO_HASH,
    };

    const event: ObservationEvent = call.payloadEmbedding
      ? {
          ...base,
          payload_embedding: call.payloadEmbedding as NonNullable<
            ObservationEvent["payload_embedding"]
          >,
        }
      : base;

    this.store.append(event);
    return event;
  }

  getStore(): ObservationStore {
    return this.store;
  }
}
