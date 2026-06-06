/** @agent-firewall/core */
export const VERSION = "0.0.0";

export { FirewallInternalError, NotImplementedError } from "./errors.js";
export { Firewall } from "./firewall.js";
export type {
  AgentTool,
  ApproveOptions,
  AuditEntry,
  FirewallConfig,
  FirewallDecision,
  KillSwitchScope,
  Policy,
  RiskTier,
  ToolCall,
} from "./types.js";
