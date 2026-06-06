/* eslint-disable */
/** Generated from JSON Schema — do not edit. Run: pnpm generate:types */

/**
 * Learning Mode behavior baseline output. Canonical spec: docs/learning-mode.md. ToolSequence defined here (see $defs).
 */
export interface BehaviorBaseline {
  agent_id: string;
  observation_period: {
    /**
     * ISO 8601 timestamp with millisecond precision.
     */
    start: string;
    /**
     * ISO 8601 timestamp with millisecond precision.
     */
    end: string;
    total_actions: number;
  };
  tools: {
    [k: string]: ToolProfile;
  };
  global_patterns: {
    actions_per_session_p50: number;
    actions_per_session_p95: number;
    interval_between_actions_p50_ms: number;
    interval_between_actions_p95_ms: number;
    common_tool_sequences: ToolSequence[];
  };
  confidence: {
    sample_size: number;
    days_of_data: number;
    confidence_score: number;
    weak_signals: string[];
  };
}
export interface ToolProfile {
  usage_count: number;
  calls_per_hour_p50: number;
  calls_per_hour_p95: number;
  calls_per_hour_max: number;
  min_interval_observed_ms: number;
  median_interval_ms: number;
  recipients_per_call_p50: number;
  recipients_per_call_p95: number;
  unique_recipients_total: number;
  recipient_overlap_rate: number;
  payload_size_p50_bytes: number;
  payload_size_p95_bytes: number;
  payload_similarity_p50: number;
  payload_similarity_max: number;
  batch_size_p50: number;
  batch_size_p95: number;
  batch_size_max: number;
}
/**
 * Observed tool-call sequence in a session baseline.
 */
export interface ToolSequence {
  /**
   * @minItems 1
   */
  tools: [string, ...string[]];
  count: number;
  frequency_p50: number;
}
