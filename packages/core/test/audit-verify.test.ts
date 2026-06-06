import { describe, expect, it } from "vitest";
import { verifyAuditChainEntries } from "../src/audit-verify.js";
import { generateKeypair, GENESIS_HASH, sha256Hex, signPayload } from "../src/utils/crypto.js";
import type { AuditEntry } from "../src/types.js";

async function signEntry(
  partial: Omit<AuditEntry, "signature">,
  privateKey: Uint8Array,
): Promise<AuditEntry> {
  const payload = JSON.stringify({
    id: partial.id,
    timestamp: partial.timestamp,
    previous_hash: partial.previous_hash,
    agent_id: partial.agent_id,
    session_id: partial.session_id,
    tool_call: partial.tool_call,
    decision: partial.decision,
    approver: partial.approver,
  });
  const signature = await signPayload(privateKey, payload);
  return { ...partial, signature };
}

describe("verifyAuditChainEntries", () => {
  it("should verify a valid chain", async () => {
    const { privateKey, publicKey } = generateKeypair();
    const base = {
      timestamp: "2026-02-01T14:00:00.000Z",
      agent_id: "agent-a",
      session_id: "sess-a",
      tool_call: {
        name: "gmail.read",
        arguments: {},
        arguments_hash: "a".repeat(64),
        risk_class: "R1" as const,
      },
      decision: {
        outcome: "allow" as const,
        by_layer: 1 as const,
        reason: "R1 auto-allow",
      },
    };

    const entry1 = await signEntry(
      { id: "entry-1", previous_hash: GENESIS_HASH, ...base },
      privateKey,
    );
    const entry2 = await signEntry(
      {
        id: "entry-2",
        previous_hash: sha256Hex(JSON.stringify(entry1)),
        ...base,
      },
      privateKey,
    );

    const result = await verifyAuditChainEntries([entry1, entry2], publicKey);
    expect(result.valid).toBe(true);
  });

  it("should detect broken previous_hash", async () => {
    const { privateKey, publicKey } = generateKeypair();
    const entry = await signEntry(
      {
        id: "entry-1",
        previous_hash: "deadbeef",
        timestamp: "2026-02-01T14:00:00.000Z",
        agent_id: "a",
        session_id: "s",
        tool_call: {
          name: "gmail.read",
          arguments: {},
          arguments_hash: "b".repeat(64),
          risk_class: "R1",
        },
        decision: { outcome: "allow", by_layer: 1, reason: "ok" },
      },
      privateKey,
    );

    const result = await verifyAuditChainEntries([entry], publicKey);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("previous_hash");
  });
});
