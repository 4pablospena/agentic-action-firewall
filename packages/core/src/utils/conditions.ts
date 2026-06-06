import type { ConditionMap } from "../generated/policy.js";

export function matchesConditions(
  args: Record<string, unknown>,
  conditions: ConditionMap,
): boolean {
  for (const [field, op] of Object.entries(conditions)) {
    const value = args[field];
    if (typeof value !== "number") {
      return false;
    }
    if (op.gt !== undefined && !(value > op.gt)) return false;
    if (op.gte !== undefined && !(value >= op.gte)) return false;
    if (op.lt !== undefined && !(value < op.lt)) return false;
    if (op.lte !== undefined && !(value <= op.lte)) return false;
    if (op.eq !== undefined && value !== op.eq) return false;
  }
  return true;
}
