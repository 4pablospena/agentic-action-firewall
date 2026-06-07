import { approvePending, checkApprovalGate } from "./layers/approval.js";
import type { AuditLog } from "./layers/audit-log.js";
import { detectAnomaly } from "./layers/anomaly.js";
import { classifyIntent, isR1AutoAllow } from "./layers/intent.js";
import { KillSwitch } from "./layers/kill-switch.js";
import { checkRemoteKillSwitch } from "./layers/kill-switch-remote.js";
import {
  checkRateLimits,
  recordRateLimitState,
  shouldSkipRateLimits,
} from "./layers/rate-limit.js";
import type { SessionState } from "./session-state.js";
import { FirewallInternalError } from "./errors.js";
import { isLearningModeActive } from "./learning/is-learning-mode.js";
import type { ObservationRecorder } from "./learning/observation-recorder.js";
import type {
  ApprovalNeededResult,
  FirewallConfig,
  FirewallDecision,
  Policy,
  ToolCall,
} from "./types.js";

export interface ResolvedFirewallConfig extends Omit<FirewallConfig, "policies"> {
  policies: Policy;
}

export interface PipelineContext {
  config: ResolvedFirewallConfig;
  state: SessionState;
  auditLog: AuditLog;
  killSwitch: KillSwitch;
  observationRecorder?: ObservationRecorder;
}

async function invokeCallback<T>(
  fn: (() => T | Promise<T>) | undefined,
): Promise<T | undefined> {
  if (!fn) {
    return undefined;
  }
  try {
    return await fn();
  } catch (error) {
    console.error("[agent-firewall] callback error:", error);
    return undefined;
  }
}

async function applyInlineApproval(
  ctx: PipelineContext,
  call: ToolCall,
  approvalId: string,
  approver: string,
  mfaVerified?: boolean,
): Promise<FirewallDecision> {
  const { pending } = approvePending(
    approvalId,
    approver,
    ctx.config.policies,
    ctx.state,
    mfaVerified === undefined ? undefined : { mfaVerified },
  );

  const decision: FirewallDecision = {
    outcome: "allow",
    byLayer: 4,
    reason: `${pending.riskTier} approved by ${approver}`,
    riskTier: pending.riskTier,
  };

  await ctx.auditLog.append(pending.call, pending.riskTier, decision, approver);
  ctx.state.recordCall({
    call: pending.call,
    riskTier: pending.riskTier,
    timestampMs: new Date(pending.call.timestamp).getTime(),
    outcome: "allow",
  });
  recordRateLimitState(pending.call, ctx.state);

  return decision;
}

async function finalizeDecision(
  ctx: PipelineContext,
  call: ToolCall,
  decision: FirewallDecision,
): Promise<FirewallDecision> {
  const auditEntry = await ctx.auditLog.append(call, decision.riskTier, decision);
  ctx.state.recordCall({
    call,
    riskTier: decision.riskTier,
    timestampMs: new Date(call.timestamp).getTime(),
    outcome: decision.outcome,
  });
  if (decision.outcome === "allow" || decision.outcome === "pending") {
    recordRateLimitState(call, ctx.state);
  }

  if (decision.outcome === "block") {
    await invokeCallback(() =>
      ctx.config.onBlock?.({ call, decision, auditEntry }),
    );
    return decision;
  }

  if (decision.outcome === "pending" && decision.approvalId) {
    const approvalId = decision.approvalId;
    const result = await invokeCallback(() =>
      ctx.config.onApprovalNeeded?.({
        call,
        decision,
        auditEntry,
        approvalId,
      }),
    );

    if (
      result &&
      typeof result === "object" &&
      "approved" in result &&
      result.approved === true &&
      decision.riskTier !== "R2"
    ) {
      const approved = result as Extract<ApprovalNeededResult, { approved: true }>;
      return applyInlineApproval(
        ctx,
        call,
        approvalId,
        approved.approver,
        approved.mfaVerified,
      );
    }
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

    const remoteKill = await checkRemoteKillSwitch(config.controlPlaneUrl, call);
    if (remoteKill.killed) {
      return finalizeDecision(ctx, call, {
        outcome: "block",
        byLayer: 5,
        reason: `Kill switch: ${remoteKill.reason}`,
        riskTier: "R1",
      });
    }

    const kill = killSwitch.isKilled(call);
    if (kill.killed) {
      return finalizeDecision(ctx, call, {
        outcome: "block",
        byLayer: 5,
        reason: `Kill switch: ${kill.reason}`,
        riskTier: "R1",
      });
    }

    if (isLearningModeActive(config)) {
      ctx.observationRecorder?.record(call);
      const { riskTier } = classifyIntent(call, policy);
      ctx.state.recordCall({
        call,
        riskTier,
        timestampMs: new Date(call.timestamp).getTime(),
        outcome: "allow",
      });
      recordRateLimitState(call, ctx.state);
      return {
        outcome: "allow",
        byLayer: 1,
        reason: "Learning mode observation",
        riskTier,
      };
    }

    const intent = classifyIntent(call, policy);
    const { riskTier } = intent;

    if (policy.anomaly_detection?.enabled) {
      const anomaly = detectAnomaly(call, policy, state, riskTier, {
        ...(config.onnxModelPath ? { onnxModelPath: config.onnxModelPath } : {}),
      });
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
