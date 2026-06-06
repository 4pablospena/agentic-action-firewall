import * as ed from "@noble/ed25519";
import type { AuditEntry } from "../generated/audit-entry.js";
import type { FirewallDecision, RiskTier, ToolCall } from "../types.js";
import {
  GENESIS_HASH,
  generateKeypair,
  sha256Hex,
  signPayload,
} from "../utils/crypto.js";
import { verifyAuditChainEntries } from "../audit-verify.js";
import { hashArguments, sanitizeArguments } from "../utils/sanitize.js";

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

function createAuditId(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[0] = (now / 2 ** 24) & 0xff;
  bytes[1] = (now / 2 ** 16) & 0xff;
  bytes[2] = (now / 2 ** 8) & 0xff;
  bytes[3] = now & 0xff;
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return [...bytes]
    .map((b, i) => {
      if (i === 4 || i === 6 || i === 8 || i === 10) {
        return `-${b.toString(16).padStart(2, "0")}`;
      }
      return b.toString(16).padStart(2, "0");
    })
    .join("");
}

export class AuditLog {
  readonly entries: AuditEntry[] = [];
  private previousHash = GENESIS_HASH;
  private readonly privateKey: Uint8Array;
  private readonly publicKey: Uint8Array;

  constructor(signingKey?: Uint8Array) {
    if (signingKey) {
      this.privateKey = signingKey;
      this.publicKey = ed.getPublicKey(signingKey);
    } else {
      const kp = generateKeypair();
      this.privateKey = kp.privateKey;
      this.publicKey = kp.publicKey;
    }
  }

  async append(
    call: ToolCall,
    riskTier: RiskTier,
    decision: FirewallDecision,
    approver?: string,
  ): Promise<AuditEntry> {
    const withoutSignature = {
      id: createAuditId(),
      timestamp: call.timestamp,
      previous_hash: this.previousHash,
      agent_id: call.agentId,
      session_id: call.sessionId,
      tool_call: {
        name: call.name,
        arguments: sanitizeArguments(call.arguments),
        arguments_hash: hashArguments(call.arguments),
        risk_class: riskTier,
      },
      decision: {
        outcome: decision.outcome,
        by_layer: decision.byLayer,
        reason: decision.reason,
      },
      ...(approver ? { approver } : {}),
    } satisfies Omit<AuditEntry, "signature">;

    const payload = serializeForSigning(withoutSignature);
    const signature = await signPayload(this.privateKey, payload);

    const entry: AuditEntry = {
      ...withoutSignature,
      signature,
    };

    this.entries.push(entry);
    this.previousHash = sha256Hex(JSON.stringify(entry));
    return entry;
  }

  setApproverOnLatest(approver: string): void {
    const latest = this.entries.at(-1);
    if (latest) {
      latest.approver = approver;
    }
  }

  async verifyChain(): Promise<boolean> {
    const result = await verifyAuditChainEntries(this.entries, this.publicKey);
    return result.valid;
  }
}
