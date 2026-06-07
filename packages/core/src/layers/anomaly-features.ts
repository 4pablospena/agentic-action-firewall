import type { Policy, ToolCall } from "../types.js";
import type { SessionState } from "../session-state.js";
import { cosineSimilarity } from "../utils/similarity.js";

const DESTRUCTIVE_TOOLS = new Set(["gmail.delete"]);

export interface AnomalyFeatureVector {
  mass_action_count_60s: number;
  loop_sequence_count: number;
  mean_interval_ms: number;
  max_similarity: number;
  recipients_unique_1h: number;
  batch_size: number;
  payload_size_bytes: number;
  destructive_tool: number;
  external_action: number;
}

function timestampMs(call: ToolCall): number {
  return new Date(call.timestamp).getTime();
}

export function extractAnomalyFeatures(
  call: ToolCall,
  policy: Policy,
  state: SessionState,
): AnomalyFeatureVector {
  const nowMs = timestampMs(call);
  const cutoff60 = nowMs - 60_000;
  const cutoffHour = nowMs - 3_600_000;

  const mass_action_count_60s =
    DESTRUCTIVE_TOOLS.has(call.name)
      ? state.callHistory.filter(
          (record) =>
            DESTRUCTIVE_TOOLS.has(record.call.name)
            && record.call.agentId === call.agentId
            && record.timestampMs >= cutoff60,
        ).length + 1
      : 0;

  const recentNames = state.callHistory
    .filter((record) => record.call.sessionId === call.sessionId && nowMs - record.timestampMs <= 60_000)
    .map((record) => record.call.name);
  recentNames.push(call.name);

  let loop_sequence_count = 0;
  for (let len = 2; len <= Math.min(5, recentNames.length); len += 1) {
    const sequence = recentNames.slice(-len).join(",");
    let occurrences = 0;
    for (let i = 0; i <= recentNames.length - len; i += 1) {
      if (recentNames.slice(i, i + len).join(",") === sequence) {
        occurrences += 1;
      }
    }
    loop_sequence_count = Math.max(loop_sequence_count, occurrences);
  }

  const externalActions = state.callHistory.filter(
    (record) =>
      record.call.agentId === call.agentId
      && nowMs - record.timestampMs <= 60_000,
  );
  const intervals = externalActions
    .slice(1)
    .map((record, index) => record.timestampMs - externalActions[index]!.timestampMs);
  const mean_interval_ms =
    intervals.length > 0
      ? intervals.reduce((sum, value) => sum + value, 0) / intervals.length
      : 0;

  let max_similarity = 0;
  if (call.payloadEmbedding) {
    const window = state.callHistory
      .filter(
        (record) =>
          record.call.name === call.name
          && record.call.sessionId === call.sessionId
          && record.call.payloadEmbedding,
      )
      .slice(-20);

    for (const record of window) {
      if (record.call.payloadEmbedding) {
        max_similarity = Math.max(
          max_similarity,
          cosineSimilarity(call.payloadEmbedding, record.call.payloadEmbedding),
        );
      }
    }
  }

  const recipients_unique_1h = new Set(
    state.callHistory
      .filter((record) => record.timestampMs >= cutoffHour)
      .flatMap((record) => record.call.recipients ?? []),
  ).size + (call.recipients?.length ?? 0);

  return {
    mass_action_count_60s,
    loop_sequence_count,
    mean_interval_ms,
    max_similarity,
    recipients_unique_1h,
    batch_size: typeof call.arguments.batch_size === "number" ? call.arguments.batch_size : 1,
    payload_size_bytes: JSON.stringify(call.arguments).length,
    destructive_tool: DESTRUCTIVE_TOOLS.has(call.name) ? 1 : 0,
    external_action: call.name.includes(".") ? 1 : 0,
  };
}

export function featureVectorToArray(vector: AnomalyFeatureVector): number[] {
  return [
    vector.mass_action_count_60s,
    vector.loop_sequence_count,
    vector.mean_interval_ms,
    vector.max_similarity,
    vector.recipients_unique_1h,
    vector.batch_size,
    vector.payload_size_bytes,
    vector.destructive_tool,
    vector.external_action,
  ];
}

export const ANOMALY_FEATURE_NAMES = [
  "mass_action_count_60s",
  "loop_sequence_count",
  "mean_interval_ms",
  "max_similarity",
  "recipients_unique_1h",
  "batch_size",
  "payload_size_bytes",
  "destructive_tool",
  "external_action",
] as const;
