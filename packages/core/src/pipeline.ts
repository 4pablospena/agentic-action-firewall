import type { AuditLog } from "./layers/audit-log.js";
import { detectAnomaly } from "./layers/anomaly.js";
import { checkApprovalGate } from "./layers/approval.js";
import { classifyIntent, isR1AutoAllow } from "./layers/intent.js";
import { KillSwitch } from "./layers/kill-switch.js";
import {
  checkRateLimits,
  recordRateLimitState,
  shouldSkipRateLimits,
} from "./layers/rate-limit.js";
import type { SessionState } from "./session-state.js";
import { FirewallInternalError } from "./errors.js";
import type {
  FirewallConfig,
  FirewallDecision,
  ToolCall,
} from "./types.js";

export interface PipelineContext {
  config: FirewallConfig;
  state: SessionState;
  auditLog: AuditLog;
  killSwitch: KillSwitch;
}

async function finalizeDecision(
  ctx: PipelineContext,
  call: ToolCall,
  decision: FirewallDecision,
): Promise<FirewallDecision> {
  await ctx.auditLog.append(call, decision.riskTier, decision);
  ctx.state.recordCall({
    call,
    riskTier: decision.riskTier,
    timestampMs: new Date(call.timestamp).getTime(),
    outcome: decision.outcome,
  });
  if (decision.outcome === "allow" || decision.outcome === "pending") {
    recordRateLimitState(call, ctx.state);
  }
  return decision;
}

export async function evaluatePipeline(
  call: ToolCall,
  ctx: PipelineContext,
): Promise<FirewallDecision> {
  try {
    const { config, state, killSwitch } = ctx;
    const policy = config.policies;

    const kill = killSwitch.isKilled(call);
    if (kill.killed) {
      return finalizeDecision(ctx, call, {
        outcome: "block",
        byLayer: 5,
        reason: `Kill switch: ${kill.reason}`,
        riskTier: "R1",
      });
    }

    const intent = classifyIntent(call, policy);
    const { riskTier } = intent;

    if (policy.anomaly_detection?.enabled) {
      const anomaly = detectAnomaly(call, policy, state, riskTier);
      if (anomaly?.triggered) {
        return finalizeDecision(ctx, call, {
          outcome: anomaly.outcome,
          byLayer: 3,
          reason: anomaly.reason,
          riskTier,
          ...(anomaly.throttleDelayMs !== undefined
            ? { throttleDelayMs: anomaly.throttleDelayMs }
            : {}),
        });
      }
    }

    if (isR1AutoAllow(riskTier, policy)) {
      return finalizeDecision(ctx, call, {
        outcome: "allow",
        byLayer: 1,
        reason: "R1 auto-allow",
        riskTier,
      });
    }

    const approval = checkApprovalGate(call, riskTier, policy, state);
    if (approval.outcome === "allow") {
      return finalizeDecision(ctx, call, {
        outcome: "allow",
        byLayer: 4,
        reason: approval.reason,
        riskTier,
      });
    }

    if (!shouldSkipRateLimits(riskTier)) {
      const rate = checkRateLimits(call, policy, state);
      if (rate.blocked) {
        return finalizeDecision(ctx, call, {
          outcome: "block",
          byLayer: 2,
          reason: rate.reason,
          riskTier,
        });
      }
    }

    return finalizeDecision(ctx, call, {
      outcome: "pending",
      byLayer: 4,
      reason: approval.reason,
      riskTier,
      ...(approval.approvalId !== undefined
        ? { approvalId: approval.approvalId }
        : {}),
    });
  } catch (error) {
    if (error instanceof FirewallInternalError) {
      return finalizeDecision(ctx, call, {
        outcome: "block",
        byLayer: error.layer,
        reason: error.message,
        riskTier: "R2",
      });
    }
    throw error;
  }
}
