import type { SanitizedArguments } from "../generated/audit-entry.js";
import { sha256HexObject } from "./crypto.js";

export function sanitizeArguments(
  args: Record<string, unknown>,
): SanitizedArguments {
  const sanitized: SanitizedArguments = {};
  for (const [key, value] of Object.entries(args)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function hashArguments(args: Record<string, unknown>): string {
  return sha256HexObject(args);
}
