# EU AI Act compliance mapping

> **Source of truth for:** how AAF satisfies EU AI Act logging and transparency requirements for high-risk AI systems.
> **NOT the source of truth for:** audit record structure — see [`concepts/audit-log.md`](./concepts/audit-log.md) and [`schemas/audit-entry.schema.json`](../schemas/audit-entry.schema.json).

## Scope

The EU AI Act (applicable from August 2026 for high-risk systems) requires providers and deployers to maintain **traceable activity logs** for autonomous AI systems. AAF addresses the **action layer** — what the agent did externally — not just model input/output.

This document maps regulatory articles to AAF capabilities. It is not legal advice.

## Article mapping

| Requirement | AAF capability | Where |
| ----------- | -------------- | ----- |
| Art. 12 — Record-keeping | Immutable audit log of every firewall decision | Layer 5, [`audit-log.md`](./concepts/audit-log.md) |
| Art. 12 — Traceability | Hash-chained entries with Ed25519 signatures | [ADR-0007](./adrs/0007-ed25519-signing.md) |
| Art. 13 — Transparency | Risk tier classification + human-readable decision reasons | Layer 1 + audit `decision.reason` |
| Human oversight | Tier-based approval gate with MFA for R4 | Layer 4, [`risk-tiers.md`](./concepts/risk-tiers.md) |
| Incident response | Kill switch + session scope | Layer 5, [`architecture.md`](./architecture.md) |

## What AAF records

Every tool call produces an audit entry (when enforcement is active) with:

- Agent and session identity
- Tool name and sanitized arguments + `arguments_hash` (full payload traceability without storing PII plaintext)
- Risk classification (R1–R4)
- Decision outcome: allow, block, throttle, or pending
- Layer that produced the decision
- Approver identity when human approval was required
- Ed25519 signature and hash chain link

See [`schemas/audit-entry.schema.json`](../schemas/audit-entry.schema.json).

## Export for auditors

```bash
# Planned CLI (Paso 2+)
aaf audit export --format eu-ai-act --from 2026-01-01 --to 2026-06-30 --output audit.json
```

Export includes:

1. Signed audit entries in chronological order
2. Workspace manifest with Ed25519 public key
3. Chain verification report (`aaf verify`)

Auditors can independently verify integrity without access to AAF internals.

## GDPR subject access

```bash
aaf audit export --gdpr-subject user@example.com --output user-activity.json
```

Filters entries where the subject appears as recipient or action target. Recipients are stored hashed — export requires local salt for correlation.

## Retention by plan

| Plan | Cloud retention | Local (OSS) |
| ---- | --------------- | ----------- |
| Open Source | N/A (self-hosted) | Unlimited local |
| Pro | 90 days | Full local copy |
| Team | 1 year | Full local copy |
| Enterprise | Configurable (up to 7 years) | Full local copy + on-chain notarization |

## Gaps and roadmap

| Gap | Phase |
| --- | ----- |
| Automated EU AI Act report templates | Phase 2 |
| On-chain notarization (Enterprise) | Phase 2b |
| Formal legal review of export format | Pre-enterprise sales |

## References

- [Immutable audit log](./concepts/audit-log.md)
- [ADR-0007: Ed25519 signing](./adrs/0007-ed25519-signing.md)
- [Product overview — EU AI Act timing](./overview.md)
- [Risk tiers](./concepts/risk-tiers.md)
