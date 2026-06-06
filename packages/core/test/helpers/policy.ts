import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type { Policy } from "../../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadPolicyFromYaml(yamlSource: string): Policy {
  const parsed = yaml.load(yamlSource);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid policy YAML");
  }
  return parsed as Policy;
}

export function loadEnforcementPolicy(): Policy {
  const path = join(__dirname, "..", "fixtures", "enforcement-policy.yml");
  return loadPolicyFromYaml(readFileSync(path, "utf8"));
}

export function createFirewallConfig(overrides?: Partial<{ policies: Policy; learningMode: boolean }>) {
  return {
    policies: overrides?.policies ?? loadEnforcementPolicy(),
    learningMode: overrides?.learningMode ?? false,
  };
}
