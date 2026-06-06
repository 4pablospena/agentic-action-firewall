import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PolicyValidationError,
  assertValidPolicy,
  formatPolicyErrors,
} from "@agent-firewall/schemas";
import yaml from "js-yaml";
import type { Policy } from "../types.js";

export { PolicyValidationError, formatPolicyErrors };

export function validatePolicyDocument(doc: unknown, label = "policy"): Policy {
  return assertValidPolicy(doc, label) as Policy;
}

export function loadPolicyFromYaml(source: string, label = "policy"): Policy {
  const parsed = yaml.load(source);
  return validatePolicyDocument(parsed, label);
}

export function loadPolicyFromPath(path: string): Policy {
  const resolved = resolve(process.cwd(), path);
  const source = readFileSync(resolved, "utf8");
  return loadPolicyFromYaml(source, resolved);
}
