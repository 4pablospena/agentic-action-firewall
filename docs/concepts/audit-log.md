# Immutable audit log (Layer 5)

> **Source of truth for:** audit log structure, cryptographic guarantees, regulatory compliance.
> Every firewall decision is recorded here.

## Why this layer exists

With agents making autonomous decisions that affect contracts, payments, communications, and customer data, the legal problem ahead is: how do you prove in an audit or court what your agent did?

Traditional logs are mutable (a dev can edit them). Observability traces are proprietary and vendor-specific. Layer 5 produces **cryptographically verifiable and immutable proof** of every firewall decision.

This matters because:

- **EU AI Act (Art. 12, 13):** requires traceable activity logs for high-risk AI systems.
- **GDPR:** audit of personal data processing.
- **Future litigation:** facing agent-action claims, the company needs to demonstrate exactly what happened.

## Record structure

> The canonical schema lives in [`/schemas/audit-entry.schema.json`](../../schemas/audit-entry.schema.json).

```typescript
interface AuditEntry {
  // ── Identity ──────────────────────────────────
  id:               string;        // uuid v7 (time-ordered)
  timestamp:        string;        // ISO 8601 with ms precision
  previous_hash:    string;        // sha256 of the previous record

  // ── Context ───────────────────────────────────
  agent_id:         string;
  session_id:       string;

  // ── The attempted action ──────────────────────
  tool_call: {
    name:           string;
    arguments:      Record<string, unknown>;
    risk_class:     "R1" | "R2" | "R3" | "R4";
  };

  // ── Firewall decision ─────────────────────────
  decision: {
    outcome:        "allow" | "block" | "throttle" | "pending";
    by_layer:       1 | 2 | 3 | 4 | 5;
    reason:         string;
  };

  // ── Layer 4: human approver ───────────────────
  approver?:        string;        // user_id if approval required

  // ── Cryptographic guarantee ───────────────────
  signature:        string;        // Ed25519 of full payload
}
```

## Cryptographic guarantees

### Per-entry Ed25519 signature

Each entry is signed with an Ed25519 private key. The corresponding public key is included in the workspace manifest, enabling independent verification by third parties (auditor, court, regulator).

**Why Ed25519:**

- Modern standard, broadly supported.
- Small signature (64 bytes) — minimal storage overhead.
- Fast verification (~50 µs).
- No native dependencies (`@noble/ed25519` is pure JS/TS).

### Hash chain

Each entry includes `previous_hash` — the sha256 of the previous entry. This creates a verifiable chain: modifying a past entry breaks all subsequent hashes, making tampering detectable.

```
Entry N-1: { ..., previous_hash: "abc..." }   sha256 → "def..."
Entry N:   { ..., previous_hash: "def..." }   sha256 → "ghi..."
Entry N+1: { ..., previous_hash: "ghi..." }   sha256 → "jkl..."
```

If someone edits Entry N, Entry N+1's `previous_hash` no longer matches. The chain is visibly broken.

### Chain verification

```typescript
async function verifyAuditChain(entries: AuditEntry[], publicKey: Ed25519PublicKey) {
  let expectedPreviousHash = "0".repeat(64);  // Genesis

  for (const entry of entries) {
    // 1. Verify chain continuity
    if (entry.previous_hash !== expectedPreviousHash) {
      throw new Error(`Chain broken at entry ${entry.id}`);
    }

    // 2. Verify signature
    const payload = serializeForSigning(entry);
    if (!ed25519.verify(entry.signature, payload, publicKey)) {
      throw new Error(`Invalid signature at entry ${entry.id}`);
    }

    // 3. Compute hash for the next verification
    expectedPreviousHash = sha256(JSON.stringify(entry));
  }

  return true;
}
```

## Storage

### Local backend (open source default)

SQLite with an append-only table. Triggers prevent UPDATE and DELETE on the audit table.

```sql
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  payload TEXT NOT NULL,
  signature TEXT NOT NULL
);

-- Prevent updates
CREATE TRIGGER no_update_audit BEFORE UPDATE ON audit_log
BEGIN
  SELECT RAISE(FAIL, 'Audit log is append-only');
END;

-- Prevent deletes
CREATE TRIGGER no_delete_audit BEFORE DELETE ON audit_log
BEGIN
  SELECT RAISE(FAIL, 'Audit log is append-only');
END;
```

### S3-compatible backend (Pro, Team, Enterprise)

Append-only via Object Lock (S3) or WORM policy (R2/MinIO). Each entry is written as an immutable object with legal TTL (configurable).

### On-chain notarization backend (Enterprise)

Every N entries (default: every 1000 or every 24h), the root hash of a Merkle tree of the entries is anchored on Ethereum or Bitcoin. This provides public proof of existence prior to a specific date.

## Export

### EU AI Act compliance format

The log can be exported in a format compatible with the requirements of EU AI Act Art. 12:

```bash
$ aaf audit export --format eu-ai-act --from 2026-01-01 --to 2026-06-30 --output audit.json

✓ Exported 12,847 entries
✓ Chain verified end-to-end
✓ Manifest with public key included
✓ Output: audit.json (47 MB)
```

### GDPR format (subject access request)

When a user requests the agent's activity records about their data:

```bash
$ aaf audit export --gdpr-subject user@example.com --output user-activity.json
```

Filters entries where the user appears as recipient or subject of the action.

## Access and permissions

| Operation              | Free / OSS | Pro       | Team           | Enterprise          |
| ---------------------- | ---------- | --------- | -------------- | ------------------- |
| Read local log         | ✅ Full    | ✅ Full   | ✅ Role-based  | ✅ Role-based       |
| Search and filtering   | Basic CLI  | Dashboard | Dashboard      | Dashboard           |
| Retention              | Unlimited local | 90 days cloud | 1 year cloud | Configurable (up to 7 years) |
| EU AI Act export       | Manual     | ✅        | ✅             | ✅                  |
| On-chain notarization  | ❌         | ❌        | ❌             | ✅                  |

## Privacy

The audit log records **firewall decisions**, not the full content of the agent's actions. Sensitive payloads are stored as hashes:

- **Email body:** `payload_hash` is stored, not the content.
- **Recipients:** stored hashed with local salt.
- **Sensitive arguments:** sanitized per policy rules (fields tagged as `pii` are omitted or redacted).

This preserves traceability without turning the audit log into a PII repository.

## Use cases

### Regulatory audit

An external auditor receives:
1. Audit log export (signed JSON or CSV).
2. Manifest with workspace public key.
3. `aaf verify` tool that validates the full chain.

The auditor can confirm the log hasn't been tampered with and review every decision.

### Post-incident investigation

When something goes wrong with an agent, the developer queries the audit log:

```bash
$ aaf audit query --agent linkedin-outreach --since "2 hours ago"

[14:23:11] tool=linkedin.connect risk=R2 decision=allow by=layer-1
[14:23:14] tool=linkedin.connect risk=R2 decision=allow by=layer-1
[14:23:17] tool=linkedin.connect risk=R2 decision=throttle by=layer-3
            reason: "Velocity 3 actions in 6s exceeds 1/3s threshold"
[14:23:30] tool=linkedin.connect risk=R2 decision=block by=layer-3
            reason: "Repetition similarity 0.94 with previous payload"
```

### Legal defense

Faced with a claim for an agent action, the legal team can present cryptographic proof of:
- What exactly the agent did.
- Who (if anyone) approved it.
- That the logs have not been tampered with since the original date.

## References

- [Architecture — Layer 5](../architecture.md)
- [EU AI Act compliance](../compliance-eu-ai-act.md)
- Schema: [`/schemas/audit-entry.schema.json`](../../schemas/audit-entry.schema.json)
- ADR-0007: [Ed25519 over RSA](../adrs/0007-ed25519-signing.md)
