import type { ToolCall, RiskTier } from "./types.js";

export interface CallRecord {
  call: ToolCall;
  riskTier: RiskTier;
  timestampMs: number;
  outcome: string;
}

export interface PendingApproval {
  id: string;
  call: ToolCall;
  riskTier: RiskTier;
  createdAtMs: number;
  cancelWindowMs: number;
  resolved: boolean;
}

export class SessionState {
  readonly callHistory: CallRecord[] = [];
  readonly pendingApprovals = new Map<string, PendingApproval>();
  readonly sessionCostUsd = new Map<string, number>();
  readonly toolCallsPerHour = new Map<string, number[]>();
  readonly lastCallByRecipient = new Map<string, number>();
  loopOccurrences = 0;

  recordCall(record: CallRecord): void {
    this.callHistory.push(record);
  }

  addCost(sessionId: string, costUsd: number): void {
    const current = this.sessionCostUsd.get(sessionId) ?? 0;
    this.sessionCostUsd.set(sessionId, current + costUsd);
  }

  getSessionCost(sessionId: string): number {
    return this.sessionCostUsd.get(sessionId) ?? 0;
  }

  recordToolCall(toolKey: string, timestampMs: number): void {
    const list = this.toolCallsPerHour.get(toolKey) ?? [];
    list.push(timestampMs);
    this.toolCallsPerHour.set(toolKey, list);
  }

  countToolCallsInLastHour(toolKey: string, nowMs: number): number {
    const list = this.toolCallsPerHour.get(toolKey) ?? [];
    const cutoff = nowMs - 3_600_000;
    const filtered = list.filter((t) => t >= cutoff);
    this.toolCallsPerHour.set(toolKey, filtered);
    return filtered.length;
  }

  setLastRecipientCall(recipientKey: string, timestampMs: number): void {
    this.lastCallByRecipient.set(recipientKey, timestampMs);
  }

  getLastRecipientCall(recipientKey: string): number | undefined {
    return this.lastCallByRecipient.get(recipientKey);
  }
}
