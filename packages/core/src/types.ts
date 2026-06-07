import type { AuditEntry } from "./generated/audit-entry.js";
import type { BehaviorBaseline } from "./generated/baseline.js";
import type { ObservationEvent } from "./generated/event.js";
import type { FirewallPolicy } from "./generated/policy.js";

export type { AuditEntry, BehaviorBaseline, ObservationEvent };
export type Policy = FirewallPolicy;
export type RiskTier = "R1" | "R2" | "R3" | "R4";

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  agentId: string;
  sessionId: string;
  timestamp: string;
  costUsd?: number;
  /** Precomputed 384-dim embedding for Layer 3 repetition tests. */
  payloadEmbedding?: number[];
  recipients?: string[];
}

export interface FirewallDecision {
  outcome: "allow" | "block" | "throttle" | "pending";
  byLayer: 1 | 2 | 3 | 4 | 5;
  reason: string;
  riskTier: RiskTier;
  throttleDelayMs?: number;
  approvalId?: string;
}

export interface ApproveOptions {
  mfaVerified?: boolean;
}

export interface BlockEvent {
  call: ToolCall;
  decision: FirewallDecision;
  auditEntry: AuditEntry;
}

export interface ApprovalNeededEvent {
  call: ToolCall;
  decision: FirewallDecision;
  auditEntry: AuditEntry;
  approvalId: string;
}

export type ApprovalNeededResult =
  | { approved: true; approver: string; mfaVerified?: boolean }
  | { approved: false; reason?: string };

export interface FirewallConfig {
  policies: Policy | string;
  signingKey?: Uint8Array;
  /** When true, no blocking (Learning Mode observation). Default false in enforcement tests. */
  learningMode?: boolean;
  /** Optional observation store; defaults to SQLite when learning mode is active. */
  observationStore?: import("./learning/observation-store.js").ObservationStore;
  /** SQLite path for observation events (default ~/.aaf/observations.db). */
  observationDbPath?: string;
  /** Optional control plane base URL for distributed kill switch (Redis-backed). */
  controlPlaneUrl?: string;
  /** Optional local ONNX model path for Layer 3 ML detector (Slice 6). */
  onnxModelPath?: string;
  onBlock?: (event: BlockEvent) => void | Promise<void>;
  onApprovalNeeded?: (
    event: ApprovalNeededEvent,
  ) => void | Promise<void | ApprovalNeededResult>;
}

export type KillSwitchScope = "all" | `agent:${string}` | `session:${string}`;

export interface AgentTool<TArgs = Record<string, unknown>, TResult = unknown> {
  name: string;
  execute: (args: TArgs) => Promise<TResult>;
}

export interface WrapContext {
  agentId: string;
  sessionId: string;
  costUsd?: number;
  recipients?: string[];
  payloadEmbedding?: number[];
}

export interface GuardOptions {
  /** Wait for R2 cancel window, re-evaluate once, then execute if allowed. Default: false. */
  waitForR2CancelWindow?: boolean;
  /** Injected by Firewall.wrap from policy; used when waitForR2CancelWindow is true. */
  cancelWindowMs?: number;
}

export interface WrapOptions {
  context?: WrapContext;
  mapCall?: (
    tool: AgentTool,
    args: Record<string, unknown>,
    ctx: WrapContext,
  ) => Partial<ToolCall>;
  guard?: GuardOptions;
}

export const DEFAULT_WRAP_CONTEXT: WrapContext = {
  agentId: "wrapped-agent",
  sessionId: "wrapped-session",
};
