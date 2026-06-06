import { d as defineEventHandler, r as requireSessionUser, u as useDb, K as workspaces, e as auditEntries } from '../../../../nitro/nitro.mjs';
import { eq, asc } from 'drizzle-orm';
import * as ed from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'ajv/dist/2020.js';
import 'ajv-formats';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'consola';

ed.etc.sha512Sync = (...messages) => sha512(ed.etc.concatBytes(...messages));
var GENESIS_HASH = "0".repeat(64);
function sha256Hex(input) {
  return bytesToHex(sha256(utf8ToBytes(input)));
}
async function verifySignature(publicKey, payload, signatureHex) {
  try {
    const signature = hexToBytes$1(signatureHex);
    return ed.verifyAsync(signature, utf8ToBytes(payload), publicKey);
  } catch {
    return false;
  }
}
function hexToBytes$1(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function serializeForSigning(entry) {
  return JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    previous_hash: entry.previous_hash,
    agent_id: entry.agent_id,
    session_id: entry.session_id,
    tool_call: entry.tool_call,
    decision: entry.decision,
    approver: entry.approver
  });
}
async function verifyAuditChainEntries(entries, publicKey) {
  let expectedPrevious = GENESIS_HASH;
  for (const entry of entries) {
    if (entry.previous_hash !== expectedPrevious) {
      return { valid: false, brokenAt: entry.id, reason: "previous_hash" };
    }
    const { signature, ...rest } = entry;
    const payload = serializeForSigning(rest);
    const valid = await verifySignature(publicKey, payload, signature);
    if (!valid) {
      return { valid: false, brokenAt: entry.id, reason: "signature" };
    }
    expectedPrevious = sha256Hex(JSON.stringify(entry));
  }
  return { valid: true };
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
const verifyChain_get = defineEventHandler(async (event) => {
  const user = await requireSessionUser(event);
  const db = useDb();
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, user.workspaceId)).limit(1);
  const rows = await db.select().from(auditEntries).where(eq(auditEntries.workspaceId, user.workspaceId)).orderBy(asc(auditEntries.ingestedAt));
  const entries = rows.map((row) => row.payload);
  if (entries.length === 0) {
    return { valid: true, entryCount: 0 };
  }
  if (!(workspace == null ? void 0 : workspace.signingPublicKey)) {
    return {
      valid: null,
      entryCount: entries.length,
      message: "No signing public key configured for workspace"
    };
  }
  const result = await verifyAuditChainEntries(
    entries,
    hexToBytes(workspace.signingPublicKey)
  );
  return {
    ...result,
    entryCount: entries.length
  };
});

export { verifyChain_get as default };
//# sourceMappingURL=verify-chain.get.mjs.map
