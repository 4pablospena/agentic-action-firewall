import type { Policy, RiskTier, ToolCall } from "../types.js";
import type { PendingApproval, SessionState } from "../session-state.js";

export interface ApprovalResult {
  outcome: "allow" | "pending";
  reason: string;
  approvalId?: string;
}

function createApprovalId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function findMatchingPending(
  call: ToolCall,
  riskTier: RiskTier,
  state: SessionState,
): PendingApproval | undefined {
  for (const pending of state.pendingApprovals.values()) {
    if (
      pending.resolved &&
      pending.call.sessionId === call.sessionId &&
      pending.call.name === call.name &&
      pending.riskTier === riskTier
    ) {
      return pending;
    }
  }
  return undefined;
}

export function checkApprovalGate(
  call: ToolCall,
  riskTier: RiskTier,
  policy: Policy,
  state: SessionState,
): ApprovalResult {
  const nowMs = Date.now();
  if (riskTier === "R1") {
    return { outcome: "allow", reason: "R1 auto-allow" };
  }

  if (riskTier === "R2") {
    const cancelWindowMs =
      (policy.approval?.r2?.cancel_window_seconds ?? 30) * 1000;

    const existingForSession = [...state.pendingApprovals.values()].find(
      (p) =>
        p.call.sessionId === call.sessionId &&
        p.call.name === call.name &&
        p.riskTier === "R2" &&
        !p.resolved,
    );

    if (existingForSession) {
      if (nowMs - existingForSession.createdAtMs >= cancelWindowMs) {
        existingForSession.resolved = true;
        return { outcome: "allow", reason: "R2 cancel window elapsed" };
      }
      return {
        outcome: "pending",
        reason: "R2 cancel window active",
        approvalId: existingForSession.id,
      };
    }

    const resolved = findMatchingPending(call, "R2", state);
    if (resolved) {
      return { outcome: "allow", reason: "R2 cancel window elapsed" };
    }

    const id = createApprovalId();
    state.pendingApprovals.set(id, {
      id,
      call,
      riskTier: "R2",
      createdAtMs: nowMs,
      cancelWindowMs,
      resolved: false,
    });
    return {
      outcome: "pending",
      reason: "R2 cancel window started",
      approvalId: id,
    };
  }

  const id = createApprovalId();
  state.pendingApprovals.set(id, {
    id,
    call,
    riskTier,
    createdAtMs: nowMs,
    cancelWindowMs: 0,
    resolved: false,
  });
  return {
    outcome: "pending",
    reason: `${riskTier} requires explicit approval`,
    approvalId: id,
  };
}

export function approvePending(
  approvalId: string,
  approver: string,
  policy: Policy,
  state: SessionState,
  opts?: { mfaVerified?: boolean },
): { pending: PendingApproval; requiresMfa: boolean } {
  const pending = state.pendingApprovals.get(approvalId);
  if (!pending) {
    throw new Error(`Unknown approval ID: ${approvalId}`);
  }

  if (
    pending.riskTier === "R4" &&
    policy.approval?.r4?.require_mfa &&
    !opts?.mfaVerified
  ) {
    throw new Error("MFA verification required for R4 approval");
  }

  pending.resolved = true;
  return { pending, requiresMfa: false };
}
