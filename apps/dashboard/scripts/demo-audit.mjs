import * as ed from "@noble/ed25519";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";

ed.etc.sha512Sync = (...messages) => sha512(ed.etc.concatBytes(...messages));

export const GENESIS_HASH = "0".repeat(64);

export function sha256Hex(input) {
  return bytesToHex(sha256(utf8ToBytes(input)));
}

export function generateKeypair() {
  const privateKey = ed.utils.randomPrivateKey();
  return { privateKey, publicKey: ed.getPublicKey(privateKey) };
}

async function signEntry(partial, privateKey) {
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
  const signature = await ed.signAsync(utf8ToBytes(payload), privateKey);
  return { ...partial, signature: bytesToHex(signature) };
}

/**
 * Build a signed demo audit chain for local dashboard seeding.
 */
export async function buildDemoAuditChain() {
  const { privateKey, publicKey } = generateKeypair();
  const publicKeyHex = bytesToHex(publicKey);

  const base = {
    agent_id: "demo-agent",
    session_id: "demo-session-001",
  };

  const specs = [
    {
      id: "demo-001",
      timestamp: "2026-02-01T10:00:00.000Z",
      tool_call: {
        name: "gmail.read",
        arguments: { query: "is:unread" },
        arguments_hash: "a".repeat(64),
        risk_class: "R1",
      },
      decision: { outcome: "allow", by_layer: 1, reason: "R1 auto-allow" },
    },
    {
      id: "demo-002",
      timestamp: "2026-02-01T10:01:00.000Z",
      tool_call: {
        name: "gmail.send",
        arguments: { to: "team@example.com" },
        arguments_hash: "b".repeat(64),
        risk_class: "R2",
      },
      decision: { outcome: "throttle", by_layer: 2, reason: "Rate limit: 10 sends/min exceeded" },
    },
    {
      id: "demo-003",
      timestamp: "2026-02-01T10:02:00.000Z",
      tool_call: {
        name: "filesystem.delete",
        arguments: { path: "/tmp/report.pdf" },
        arguments_hash: "c".repeat(64),
        risk_class: "R3",
      },
      decision: { outcome: "pending", by_layer: 4, reason: "R3 requires human approval" },
    },
    {
      id: "demo-004",
      timestamp: "2026-02-01T10:03:00.000Z",
      tool_call: {
        name: "gmail.delete",
        arguments: { batch_size: 50, label: "INBOX" },
        arguments_hash: "d".repeat(64),
        risk_class: "R4",
      },
      decision: {
        outcome: "block",
        by_layer: 3,
        reason: "Mass action: 51 destructive operations in 45s exceeds threshold",
      },
    },
  ];

  const entries = [];
  let previousHash = GENESIS_HASH;

  for (const spec of specs) {
    const entry = await signEntry(
      { ...base, ...spec, previous_hash: previousHash },
      privateKey,
    );
    entries.push(entry);
    previousHash = sha256Hex(JSON.stringify(entry));
  }

  return { publicKeyHex, entries };
}

export const DEMO_ENTRY_ID_PREFIX = "demo-";
