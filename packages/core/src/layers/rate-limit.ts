import type { Policy, ToolCall } from "../types.js";
import type { SessionState } from "../session-state.js";
import { parseDurationMs } from "../utils/duration.js";

export interface RateLimitResult {
  blocked: boolean;
  reason: string;
}

const MIN_INTERVAL_WINDOW_THRESHOLD = 5;

function recipientKey(call: ToolCall): string {
  const recipient =
    call.recipients?.[0] ??
    (typeof call.arguments.to === "string" ? call.arguments.to : "default");
  return `${call.name}:${recipient}`;
}

function countRecentR2Attempts(
  state: SessionState,
  sessionId: string,
  nowMs: number,
): number {
  const cutoff = nowMs - 60_000;
  return state.callHistory.filter(
    (r) =>
      r.call.sessionId === sessionId &&
      r.riskTier !== "R1" &&
      r.timestampMs >= cutoff,
  ).length;
}

export function checkRateLimits(
  call: ToolCall,
  policy: Policy,
  state: SessionState,
): RateLimitResult {
  const toolPolicy = policy.tools?.[call.name];
  const nowMs = new Date(call.timestamp).getTime();
  const rateLimits = toolPolicy?.rate_limits;
  const maxCost = policy.budget?.max_cost_per_session_usd ?? 5;

  const historyCost = state.callHistory
    .filter((r) => r.call.sessionId === call.sessionId)
    .reduce((sum, r) => sum + (r.call.costUsd ?? 0), 0);
  const sessionCost = historyCost + (call.costUsd ?? 0);
  if (sessionCost > maxCost) {
    return {
      blocked: true,
      reason: `Session cost $${sessionCost.toFixed(2)} exceeds budget $${maxCost}`,
    };
  }

  if (rateLimits?.per_hour !== undefined && call.costUsd === undefined && !call.payloadEmbedding) {
    const toolKey = `${call.sessionId}:${call.name}`;
    const count = state.countToolCallsInLastHour(toolKey, nowMs);
    if (count >= rateLimits.per_hour) {
      return {
        blocked: true,
        reason: `Rate limit per_hour (${rateLimits.per_hour}) exceeded for ${call.name}`,
      };
    }
  }

  if (rateLimits?.min_interval !== undefined) {
    const recentAttempts = countRecentR2Attempts(state, call.sessionId, nowMs);
    if (recentAttempts < MIN_INTERVAL_WINDOW_THRESHOLD) {
      const intervalMs = parseDurationMs(rateLimits.min_interval);
      const key = recipientKey(call);
      const lastAt = state.getLastRecipientCall(key);
      if (lastAt !== undefined && nowMs - lastAt < intervalMs) {
        return {
          blocked: true,
          reason: `Minimum interval ${rateLimits.min_interval} not met for recipient`,
        };
      }
    }
  }

  return { blocked: false, reason: "" };
}

export function recordRateLimitState(
  call: ToolCall,
  state: SessionState,
): void {
  const nowMs = new Date(call.timestamp).getTime();
  const toolKey = `${call.sessionId}:${call.name}`;
  state.recordToolCall(toolKey, nowMs);
  state.setLastRecipientCall(recipientKey(call), nowMs);
  if (call.costUsd !== undefined) {
    state.addCost(call.sessionId, call.costUsd);
  }
}

export function shouldSkipRateLimits(riskTier: string): boolean {
  return riskTier === "R1";
}
