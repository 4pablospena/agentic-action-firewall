import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Firewall, loadPolicyFromYaml } from "@agent-firewall/core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const enforcementPolicyPath = join(
  __dirname,
  "..",
  "..",
  "..",
  "core",
  "test",
  "fixtures",
  "enforcement-policy.yml",
);

export function createTestFirewall(): Firewall {
  return new Firewall({
    policies: loadPolicyFromYaml(
      readFileSync(enforcementPolicyPath, "utf8"),
      enforcementPolicyPath,
    ),
  });
}

export const TEST_WRAP_CONTEXT = {
  agentId: "openai-agent",
  sessionId: "sess_openai_001",
} as const;
