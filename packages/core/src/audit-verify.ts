import type { AuditEntry } from "./generated/audit-entry.js";
import {
  GENESIS_HASH,
  sha256Hex,
  verifySignature,
} from "./utils/crypto.js";

function serializeForSigning(entry: Omit<AuditEntry, "signature">): string {
  return JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    previous_hash: entry.previous_hash,
    agent_id: entry.agent_id,
    session_id: entry.session_id,
    tool_call: entry.tool_call,
    decision: entry.decision,
    approver: entry.approver,
  });
}

export interface AuditChainVerificationResult {
  valid: boolean;
  brokenAt?: string;
  reason?: "previous_hash" | "signature";
}

export async function verifyAuditChainEntries(
  entries: readonly AuditEntry[],
  publicKey: Uint8Array,
): Promise<AuditChainVerificationResult> {
  let expectedPrevious = GENESIS_HASH;

  for (const entry of entries) {
    if (entry.previous_hash !== expectedPrevious) {
      return { valid: false, brokenAt: entry.id, reason: "previous_hash" };
    }

    const { signature, ...rest } = entry;
    const payload = serializeForSigning(rest as Omit<AuditEntry, "signature">);
    const valid = await verifySignature(publicKey, payload, signature);
    if (!valid) {
      return { valid: false, brokenAt: entry.id, reason: "signature" };
    }

    expectedPrevious = sha256Hex(JSON.stringify(entry));
  }

  return { valid: true };
}
