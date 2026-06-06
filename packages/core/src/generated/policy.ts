/* eslint-disable */
/** Generated from JSON Schema — do not edit. Run: pnpm generate:types */

/**
 * firewall.yml policy document. Canonical shape: this schema. Human docs: docs/policies/reference.md. ADR-0003, ADR-0005.
 */
export interface FirewallPolicy {
  version: "1";
  learning_mode?: {
    enabled: boolean;
    /**
     * Default 72h per ADR-0004. Auto-extends to 7d if insufficient activity.
     */
    observation_hours?: number;
  };
  /**
   * Per-tool policy keyed by tool name (namespace.action).
   */
  tools?: {
    [k: string]: ToolPolicy;
  };
  anomaly_detection?: {
    enabled: boolean;
    patterns?: {
      repetition?: RepetitionPattern;
      loop?: LoopPattern;
      speed?: SpeedPattern;
      mass_action?: MassActionPattern;
      recipient_escalation?: RecipientEscalationPattern;
      scope_drift?: ScopeDriftPattern;
    };
  };
  approval?: {
    r1?: "auto_allow" | "notify";
    r2?: {
      cancel_window_seconds?: number;
    };
    r3?: {
      require_explicit_approval?: true;
    };
    r4?: {
      require_mfa: true;
      /**
       * R4 is never relaxable per ADR-0005.
       */
      relaxable: false;
    };
  };
  budget?: {
    /**
     * Layer 2 session cost cap (LangChain $47K incident mitigation).
     */
    max_cost_per_session_usd?: number;
  };
}
export interface ToolPolicy {
  /**
   * Canonical risk tier. See docs/concepts/risk-tiers.md and ADR-0005.
   */
  risk: "R1" | "R2" | "R3" | "R4";
  when?: ConditionMap;
  /**
   * Canonical risk tier. See docs/concepts/risk-tiers.md and ADR-0005.
   */
  escalate_to?: "R1" | "R2" | "R3" | "R4";
  rate_limits?: {
    per_hour?: number;
    /**
     * Minimum interval between calls, e.g. 2s, 500ms.
     */
    min_interval?: string;
    per_recipient_24h?: number;
    per_session?: number;
  };
  anomaly_thresholds?: {
    unique_recipients_per_hour?: number;
    payload_similarity?: number;
  };
  require_approval?: {
    /**
     * @minItems 1
     */
    when: [ConditionMap, ...ConditionMap[]];
  };
}
/**
 * Field name to comparison operator, e.g. { batch_size: { gt: 10 } }.
 */
export interface ConditionMap {
  [k: string]: ComparisonOperator;
}
export interface ComparisonOperator {
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  eq?: unknown;
}
export interface RepetitionPattern {
  enabled: boolean;
  threshold?: number;
  action_if_recipients_gt?: number;
}
export interface LoopPattern {
  enabled: boolean;
  sequence_min_length?: number;
  window_seconds?: number;
  max_occurrences?: number;
}
export interface SpeedPattern {
  enabled: boolean;
  /**
   * Default 0.33 = 1 action every 3 seconds.
   */
  max_per_second?: number;
}
export interface MassActionPattern {
  enabled: boolean;
  threshold_per_minute?: number;
  action?: "pause_and_snapshot" | "block" | "require_approval";
}
export interface RecipientEscalationPattern {
  enabled: boolean;
  baseline_multiplier?: number;
}
export interface ScopeDriftPattern {
  enabled: boolean;
  require_approval_on_first_use?: boolean;
}
