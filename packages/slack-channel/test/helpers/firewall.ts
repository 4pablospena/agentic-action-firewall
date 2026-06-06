import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Firewall,
  loadPolicyFromYaml,
  type FirewallConfig,
  type Policy,
} from "@agent-firewall/core";
import type { SlackApprovalConfig } from "../../src/types.js";

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

export function loadEnforcementPolicy(): Policy {
  return loadPolicyFromYaml(
    readFileSync(enforcementPolicyPath, "utf8"),
    enforcementPolicyPath,
  );
}

export function createTestFirewall(
  overrides: Omit<FirewallConfig, "policies"> = {},
): Firewall {
  return new Firewall({
    policies: loadEnforcementPolicy(),
    ...overrides,
  });
}

export const TEST_SLACK_CONFIG: SlackApprovalConfig = {
  botToken: "xoxb-test",
  channelId: "C123",
  approvalTimeoutMs: 5_000,
  mfaApproverIds: ["U-MFA-OK"],
};

export const TEST_WRAP_CONTEXT = {
  agentId: "slack-agent",
  sessionId: "sess-slack-001",
} as const;
