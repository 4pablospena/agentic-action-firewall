/* eslint-disable */
/** Generated from JSON Schema — do not edit. Run: pnpm generate:types */

/**
 * Layer 3 detector output. Canonical spec: docs/concepts/anomaly-detection.md. ADR-0006.
 */
export interface AnomalyResult {
  detected: boolean;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  /**
   * Anomaly pattern that triggered detection. See docs/concepts/anomaly-detection.md.
   */
  pattern: "repetition" | "loop" | "speed" | "mass_action" | "recipient_escalation" | "scope_drift";
  reason: string;
  suggested:
    | {
        type: "allow";
      }
    | {
        type: "throttle";
        delay_ms: number;
      }
    | {
        type: "block";
        require_approval: boolean;
      }
    | {
        type: "kill_session";
        reason: string;
      };
  evidence: {
    events: string[];
    metrics: {
      [k: string]: number;
    };
  };
}
