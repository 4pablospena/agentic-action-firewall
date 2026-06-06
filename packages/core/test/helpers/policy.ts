import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadPolicyFromYaml as loadValidatedPolicyFromYaml,
} from "../../src/policy/load.js";
import type { Policy } from "../../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadPolicyFromYaml(yamlSource: string): Policy {
  return loadValidatedPolicyFromYaml(yamlSource, "test-policy");
}

export function loadEnforcementPolicy(): Policy {
  const path = join(__dirname, "..", "fixtures", "enforcement-policy.yml");
  return loadValidatedPolicyFromYaml(readFileSync(path, "utf8"), path);
}

export function createFirewallConfig(overrides?: Partial<{ policies: Policy; learningMode: boolean }>) {
  return {
    policies: overrides?.policies ?? loadEnforcementPolicy(),
    learningMode: overrides?.learningMode ?? false,
  };
}
