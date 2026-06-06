/** @agent-firewall/core */
export const VERSION = "0.0.0";

export { FirewallInternalError, NotImplementedError } from "./errors.js";
export { FirewallBlockedError, Firewall } from "./firewall.js";
export {
  loadPolicyFromPath,
  loadPolicyFromYaml,
  PolicyValidationError,
  validatePolicyDocument,
  formatPolicyErrors,
} from "./policy/load.js";
export type {
  AgentTool,
  ApprovalNeededEvent,
  ApprovalNeededResult,
  ApproveOptions,
  AuditEntry,
  BlockEvent,
  FirewallConfig,
  FirewallDecision,
  KillSwitchScope,
  Policy,
  RiskTier,
  ToolCall,
} from "./types.js";
