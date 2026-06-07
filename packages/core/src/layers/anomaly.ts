import type { Policy, RiskTier, ToolCall } from "../types.js";
import type { SessionState } from "../session-state.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { OnnxAnomalyDetector } from "./anomaly-ml.js";

export interface AnomalyResult {
  triggered: boolean;
  outcome: "block" | "throttle";
  reason: string;
  throttleDelayMs?: number;
}

const DESTRUCTIVE_TOOLS = new Set(["gmail.delete"]);

function timestampMs(call: ToolCall): number {
  return new Date(call.timestamp).getTime();
}

function detectMassAction(
  call: ToolCall,
  state: SessionState,
  policy: Policy,
): AnomalyResult | null {
  const pattern = policy.anomaly_detection?.patterns?.mass_action;
  if (!pattern?.enabled || !DESTRUCTIVE_TOOLS.has(call.name)) {
    return null;
  }

  const nowMs = timestampMs(call);
  const cutoff = nowMs - 60_000;
  const count =
    state.callHistory.filter(
      (r) =>
        DESTRUCTIVE_TOOLS.has(r.call.name) &&
        r.call.agentId === call.agentId &&
        r.timestampMs >= cutoff,
    ).length + 1;

  const threshold = pattern.threshold_per_minute ?? 50;
  if (count > threshold) {
    return {
      triggered: true,
      outcome: "block",
      reason: `Mass destructive action: ${count} operations in 60s (threshold ${threshold})`,
    };
  }
  return null;
}

function detectLoop(
  call: ToolCall,
  state: SessionState,
  policy: Policy,
): AnomalyResult | null {
  const pattern = policy.anomaly_detection?.patterns?.loop;
  if (!pattern?.enabled) {
    return null;
  }

  const windowMs = (pattern.window_seconds ?? 60) * 1000;
  const minLen = pattern.sequence_min_length ?? 2;
  const maxOcc = pattern.max_occurrences ?? 3;
  const nowMs = timestampMs(call);

  const recentNames = state.callHistory
    .filter(
      (r) =>
        r.call.sessionId === call.sessionId &&
        nowMs - r.timestampMs <= windowMs,
    )
    .map((r) => r.call.name);
  recentNames.push(call.name);

  for (let len = minLen; len <= Math.min(5, recentNames.length); len += 1) {
    if (recentNames.length < len * (maxOcc + 1)) {
      continue;
    }
    const sequenceParts = recentNames.slice(-len);
    if (new Set(sequenceParts).size < 2) {
      continue;
    }
    const sequence = sequenceParts.join(",");
    let occurrences = 0;
    for (let i = 0; i <= recentNames.length - len; i += 1) {
      if (recentNames.slice(i, i + len).join(",") === sequence) {
        occurrences += 1;
      }
    }
    if (occurrences > maxOcc) {
      const delay = 1000 * 2 ** (occurrences - maxOcc - 1);
      return {
        triggered: true,
        outcome: "throttle",
        reason: `Tool loop detected: sequence repeated ${occurrences} times`,
        throttleDelayMs: delay,
      };
    }
  }
  return null;
}

function detectSpeed(
  call: ToolCall,
  state: SessionState,
  policy: Policy,
  riskTier: RiskTier,
): AnomalyResult | null {
  const pattern = policy.anomaly_detection?.patterns?.speed;
  if (!pattern?.enabled || riskTier === "R1") {
    return null;
  }

  const nowMs = timestampMs(call);
  const windowMs = 60_000;
  const cutoff = nowMs - windowMs;

  const timestamps = state.callHistory
    .filter(
      (r) =>
        r.riskTier !== "R1" &&
        r.call.sessionId === call.sessionId &&
        r.timestampMs >= cutoff,
    )
    .map((r) => r.timestampMs);
  timestamps.push(nowMs);
  timestamps.sort((a, b) => a - b);

  if (timestamps.length < 10) {
    return null;
  }

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i += 1) {
    intervals.push(timestamps[i]! - timestamps[i - 1]!);
  }
  const meanInterval =
    intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
  const span = timestamps.at(-1)! - timestamps[0]!;
  const maxPerSecond = pattern.max_per_second ?? 0.33;
  const minIntervalMs = 1 / maxPerSecond * 1000;

  if (meanInterval < minIntervalMs && span >= 45_000) {
    return {
      triggered: true,
      outcome: "throttle",
      reason: `Superhuman velocity: mean interval ${Math.round(meanInterval)}ms over ${Math.round(span / 1000)}s`,
      throttleDelayMs: Math.round(minIntervalMs - meanInterval),
    };
  }
  return null;
}

function detectRepetition(
  call: ToolCall,
  state: SessionState,
  policy: Policy,
): AnomalyResult | null {
  const pattern = policy.anomaly_detection?.patterns?.repetition;
  if (!pattern?.enabled || !call.payloadEmbedding) {
    return null;
  }

  const threshold = pattern.threshold ?? 0.92;
  const recipientThreshold = pattern.action_if_recipients_gt ?? 5;
  const nowMs = timestampMs(call);
  const cutoff = nowMs - 3_600_000;

  const similarRecipients = new Set<string>();
  for (const record of state.callHistory) {
    if (
      record.call.name !== call.name ||
      record.timestampMs < cutoff ||
      !record.call.payloadEmbedding
    ) {
      continue;
    }
    const sim = cosineSimilarity(
      call.payloadEmbedding,
      record.call.payloadEmbedding!,
    );
    if (sim >= threshold) {
      const recipient =
        record.call.recipients?.[0] ??
        (typeof record.call.arguments.to === "string"
          ? record.call.arguments.to
          : undefined);
      if (recipient) {
        similarRecipients.add(recipient);
      }
    }
  }

  const currentRecipient =
    call.recipients?.[0] ??
    (typeof call.arguments.to === "string" ? call.arguments.to : undefined);
  if (currentRecipient) {
    similarRecipients.add(currentRecipient);
  }

  if (similarRecipients.size > recipientThreshold && call.payloadEmbedding) {
    const currentEmbedding = call.payloadEmbedding;
    const hasSimilarHistory = state.callHistory.some((r) => {
      const embedding = r.call.payloadEmbedding;
      return (
        r.call.name === call.name &&
        embedding !== undefined &&
        cosineSimilarity(currentEmbedding, embedding) >= threshold
      );
    });
    if (hasSimilarHistory) {
      return {
        triggered: true,
        outcome: "block",
        reason: `Repetition detected: ${similarRecipients.size} similar recipients (threshold ${recipientThreshold})`,
      };
    }
  }
  return null;
}

export function detectAnomaly(
  call: ToolCall,
  policy: Policy,
  state: SessionState,
  riskTier: RiskTier,
  options?: { onnxModelPath?: string },
): AnomalyResult | null {
  if (!policy.anomaly_detection?.enabled) {
    return null;
  }

  const ml = new OnnxAnomalyDetector(options?.onnxModelPath).detect(
    call,
    policy,
    state,
    riskTier,
  );
  if (ml) {
    return ml;
  }

  return (
    detectMassAction(call, state, policy) ??
    detectLoop(call, state, policy) ??
    detectRepetition(call, state, policy) ??
    detectSpeed(call, state, policy, riskTier)
  );
}
