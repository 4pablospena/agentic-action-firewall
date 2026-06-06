import type { Policy, RiskTier, ToolCall } from "../types.js";
import { matchesConditions } from "../utils/conditions.js";

export interface IntentResult {
  riskTier: RiskTier;
  layer: 1;
}

export function classifyIntent(call: ToolCall, policy: Policy): IntentResult {
  const toolPolicy = policy.tools?.[call.name];
  let riskTier: RiskTier = toolPolicy?.risk ?? "R2";

  if (toolPolicy?.when && toolPolicy.escalate_to) {
    if (matchesConditions(call.arguments, toolPolicy.when)) {
      riskTier = toolPolicy.escalate_to;
    }
  }

  return { riskTier, layer: 1 };
}

export function isR1AutoAllow(riskTier: RiskTier, policy: Policy): boolean {
  return riskTier === "R1" && policy.approval?.r1 === "auto_allow";
}
