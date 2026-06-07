import type { AuditEntry } from "@agent-firewall/core";

/**
 * Demo audit chain builder for local seeding.
 * Implementation: {@link ../../../scripts/demo-audit.mjs}
 */
export type DemoAuditChain = {
  publicKeyHex: string;
  entries: AuditEntry[];
};

export const DEMO_ENTRY_ID_PREFIX = "demo-";
