import type { AuditEntry } from "./generated/audit-entry.js";
import type { FirewallPolicy } from "./generated/policy.js";

export type { AuditEntry };
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

export interface FirewallConfig {
  policies: Policy;
  signingKey?: Uint8Array;
  /** When true, no blocking (Learning Mode observation). Default false in enforcement tests. */
  learningMode?: boolean;
}

export type KillSwitchScope = "all" | `agent:${string}` | `session:${string}`;

export interface AgentTool<TArgs = Record<string, unknown>, TResult = unknown> {
  name: string;
  execute: (args: TArgs) => Promise<TResult>;
}
