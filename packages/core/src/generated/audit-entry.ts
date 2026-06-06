/* eslint-disable */
/** Generated from JSON Schema — do not edit. Run: pnpm generate:types */

/**
 * Immutable audit log record. Canonical spec: docs/concepts/audit-log.md. ADR-0007. Privacy: arguments are sanitized; arguments_hash is required for full payload traceability.
 */
export interface AuditEntry {
  /**
   * UUID version 7 (time-ordered).
   */
  id: string;
  /**
   * ISO 8601 timestamp with millisecond precision.
   */
  timestamp: string;
  /**
   * Lowercase hexadecimal SHA-256 digest.
   */
  previous_hash: string;
  agent_id: string;
  session_id: string;
  tool_call: {
    /**
     * Tool identifier in namespace.action form, e.g. gmail.send.
     */
    name: string;
    arguments: SanitizedArguments;
    /**
     * Lowercase hexadecimal SHA-256 digest.
     */
    arguments_hash: string;
    /**
     * Canonical risk tier. See docs/concepts/risk-tiers.md and ADR-0005.
     */
    risk_class: "R1" | "R2" | "R3" | "R4";
  };
  decision: {
    /**
     * Firewall decision outcome recorded in audit log.
     */
    outcome: "allow" | "block" | "throttle" | "pending";
    /**
     * Layer that produced the decision.
     */
    by_layer: 1 | 2 | 3 | 4 | 5;
    reason: string;
  };
  /**
   * user_id when Layer 4 approval was involved.
   */
  approver?: string;
  /**
   * Ed25519 signature (64 bytes, hex-encoded).
   */
  signature: string;
}
/**
 * Sanitized tool arguments. PII fields omitted per policy. Values must be JSON primitives.
 */
export interface SanitizedArguments {
  [k: string]: string | number | boolean | null;
}
