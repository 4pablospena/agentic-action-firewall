/** @agent-firewall/core */
export const VERSION = "0.0.0";

export { FirewallBlockedError, FirewallInternalError, NotImplementedError } from "./errors.js";
export { Firewall } from "./firewall.js";
export {
  loadPolicyFromPath,
  loadPolicyFromYaml,
  PolicyValidationError,
  validatePolicyDocument,
  formatPolicyErrors,
} from "./policy/load.js";
export {
  buildToolCall,
  guardToolExecution,
  wrapAgentTools,
} from "./wrap.js";
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
  WrapContext,
  WrapOptions,
} from "./types.js";
export { DEFAULT_WRAP_CONTEXT } from "./types.js";
