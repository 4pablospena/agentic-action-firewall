import type { ResolvedFirewallConfig } from "../pipeline.js";

export function isLearningModeActive(config: ResolvedFirewallConfig): boolean {
  if (config.learningMode === true) {
    return true;
  }
  return config.policies.learning_mode?.enabled === true;
}

export function observationHours(config: ResolvedFirewallConfig): number {
  return config.policies.learning_mode?.observation_hours ?? 72;
}
