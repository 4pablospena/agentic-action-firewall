import { wrapAgentTools } from "./wrap.js";
import type {
  AgentTool,
  ApproveOptions,
  AuditEntry,
  FirewallConfig,
  FirewallDecision,
  KillSwitchScope,
  Policy,
  ToolCall,
  WrapOptions,
} from "./types.js";
import { AuditLog } from "./layers/audit-log.js";
import { approvePending } from "./layers/approval.js";
import { KillSwitch } from "./layers/kill-switch.js";
import { recordRateLimitState } from "./layers/rate-limit.js";
import { loadPolicyFromPath } from "./policy/load.js";
import { evaluatePipeline, type ResolvedFirewallConfig } from "./pipeline.js";
import { SessionState } from "./session-state.js";
import {
  buildBaseline,
  baselineToPolicyYamlSnippet,
  createDefaultObservationStore,
  isLearningModeActive,
  ObservationRecorder,
} from "./learning/index.js";
import type { BehaviorBaseline } from "./generated/baseline.js";
import type { ObservationEvent } from "./generated/event.js";

export class Firewall {
  private readonly resolvedConfig: ResolvedFirewallConfig;
  private readonly auditLog: AuditLog;
  private readonly killSwitch = new KillSwitch();
  private readonly state = new SessionState();
  private readonly observationRecorder?: ObservationRecorder;

  constructor(config: FirewallConfig) {
    const policies: Policy =
      typeof config.policies === "string"
        ? loadPolicyFromPath(config.policies)
        : config.policies;

    this.resolvedConfig = { ...config, policies };
    this.auditLog = new AuditLog(config.signingKey);

    if (config.observationStore || isLearningModeActive(this.resolvedConfig)) {
      const store =
        config.observationStore
        ?? createDefaultObservationStore(config.observationDbPath);
      this.observationRecorder = new ObservationRecorder(store);
    }
  }

  async evaluate(call: ToolCall): Promise<FirewallDecision> {
    return evaluatePipeline(call, {
      config: this.resolvedConfig,
      state: this.state,
      auditLog: this.auditLog,
      killSwitch: this.killSwitch,
      ...(this.observationRecorder
        ? { observationRecorder: this.observationRecorder }
        : {}),
    });
  }

  wrap<T extends AgentTool>(tools: T[], options?: WrapOptions): T[] {
    const cancelWindowMs =
      (this.resolvedConfig.policies.approval?.r2?.cancel_window_seconds ?? 30) * 1000;
    return wrapAgentTools(this, tools, {
      ...options,
      guard: {
        cancelWindowMs,
        ...options?.guard,
      },
    });
  }

  async activateKillSwitch(scope: KillSwitchScope, reason: string): Promise<void> {
    this.killSwitch.activate(scope, reason);
  }

  isKilled(scope: KillSwitchScope): boolean {
    return this.killSwitch.isActive(scope);
  }

  async approve(
    approvalId: string,
    approver: string,
    opts?: ApproveOptions,
  ): Promise<FirewallDecision> {
    const { pending } = approvePending(
      approvalId,
      approver,
      this.resolvedConfig.policies,
      this.state,
      opts,
    );

    const decision: FirewallDecision = {
      outcome: "allow",
      byLayer: 4,
      reason: `${pending.riskTier} approved by ${approver}`,
      riskTier: pending.riskTier,
    };

    await this.auditLog.append(pending.call, pending.riskTier, decision, approver);
    this.state.recordCall({
      call: pending.call,
      riskTier: pending.riskTier,
      timestampMs: new Date(pending.call.timestamp).getTime(),
      outcome: "allow",
    });
    recordRateLimitState(pending.call, this.state);

    return decision;
  }

  getAuditEntries(): AuditEntry[] {
    return this.auditLog.entries;
  }

  async verifyAuditChain(): Promise<boolean> {
    return this.auditLog.verifyChain();
  }

  getObservationEvents(agentId?: string): ObservationEvent[] {
    return this.observationRecorder?.getStore().list(agentId) ?? [];
  }

  exportBaseline(agentId: string): BehaviorBaseline {
    return buildBaseline(agentId, this.getObservationEvents(agentId));
  }

  exportBaselineYaml(agentId: string): string {
    return baselineToPolicyYamlSnippet(this.exportBaseline(agentId));
  }

  isLearningModeActive(): boolean {
    return isLearningModeActive(this.resolvedConfig);
  }
}

export type { FirewallConfig };
