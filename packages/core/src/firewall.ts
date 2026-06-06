import { NotImplementedError } from "./errors.js";
import type {
  AgentTool,
  ApproveOptions,
  AuditEntry,
  FirewallConfig,
  FirewallDecision,
  KillSwitchScope,
  ToolCall,
} from "./types.js";

export class Firewall {
  constructor(private readonly config: FirewallConfig) {}

  async evaluate(_call: ToolCall): Promise<FirewallDecision> {
    throw new NotImplementedError("Firewall.evaluate");
  }

  wrap<T extends AgentTool>(tools: T[]): T[] {
    throw new NotImplementedError("Firewall.wrap");
  }

  async activateKillSwitch(_scope: KillSwitchScope, _reason: string): Promise<void> {
    throw new NotImplementedError("Firewall.activateKillSwitch");
  }

  isKilled(_scope: KillSwitchScope): boolean {
    throw new NotImplementedError("Firewall.isKilled");
  }

  async approve(
    _approvalId: string,
    _approver: string,
    _opts?: ApproveOptions,
  ): Promise<FirewallDecision> {
    throw new NotImplementedError("Firewall.approve");
  }

  getAuditEntries(): AuditEntry[] {
    throw new NotImplementedError("Firewall.getAuditEntries");
  }

  async verifyAuditChain(): Promise<boolean> {
    throw new NotImplementedError("Firewall.verifyAuditChain");
  }
}

export type { FirewallConfig };
