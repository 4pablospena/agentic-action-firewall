# Agent Action Firewall — Documentation

> **Before you read:** the source-of-truth hierarchy is defined in [`adrs/0001-source-of-truth.md`](./adrs/0001-source-of-truth.md). If you haven't read it, start there.

## Structure

```
docs/
├── README.md                       ← this file
├── overview.md                     ← product, market, business, roadmap
├── architecture.md                 ← 5-layer technical architecture
├── learning-mode.md                ← Learning Mode specification
├── policies/
│   └── reference.md                ← firewall.yml format
├── compliance-eu-ai-act.md         ← EU AI Act mapping
├── risks.md                        ← product risk analysis
│
├── concepts/                       ← canonical product concepts
│   ├── risk-tiers.md               ← R1, R2, R3, R4 — authoritative definition
│   ├── anomaly-detection.md        ← Layer 3 in detail
│   └── audit-log.md                ← Layer 5 in detail
│
├── policies/
│   └── reference.md                ← firewall.yml format (links to schema)
├── compliance-eu-ai-act.md         ← EU AI Act mapping
├── risks.md                        ← product risk analysis
│
└── adrs/                           ← Architecture Decision Records
    ├── TEMPLATE.md
    ├── 0001-source-of-truth.md     ← the level hierarchy
    ├── 0002-typescript-first.md
    ├── 0003-yaml-for-policies.md
    ├── 0004-observation-window.md
    ├── 0005-four-tier-risk.md
    ├── 0006-heuristics-first.md
    └── 0007-ed25519-signing.md
```

## Conventions

### Every document declares its authority

At the top of each doc:

```markdown
> **Source of truth for:** [what this doc decides]
> **NOT the source of truth for:** [redirect to where it lives]
```

If a doc can't declare what it decides, it probably shouldn't exist as a separate doc.

### When a doc references another

Use relative links. Never duplicate content. If a 4-line section appears twice, one of them must become a link.

```markdown
# ❌ Bad
Risk tiers are R1, R2, R3, R4. R1 is...
[full content duplicated]

# ✅ Good
For the canonical definition of risk tiers, see [`concepts/risk-tiers.md`](./concepts/risk-tiers.md).
In this doc we focus on how Layer 1 applies them.
```

### Significant changes require an ADR

Editing the doc is not enough. If the decision is structural (changes behavior, contracts, or sets precedent), open an ADR first, discuss it, accept it, and then edit the doc.

Accepted ADRs:

- [ADR-0002: TypeScript as primary language](./adrs/0002-typescript-first.md)
- [ADR-0003: YAML for policies](./adrs/0003-yaml-for-policies.md)
- [ADR-0004: 72h observation window](./adrs/0004-observation-window.md)
- [ADR-0005: 4-tier risk structure](./adrs/0005-four-tier-risk.md)
- [ADR-0006: Heuristics first, ML later](./adrs/0006-heuristics-first.md)
- [ADR-0007: Ed25519 over RSA](./adrs/0007-ed25519-signing.md)

## For contributors

### Before changing a doc

1. Is this the right place for this information? Consult the source-of-truth table in [`adrs/0001`](./adrs/0001-source-of-truth.md).
2. Are you duplicating content that already exists in another doc?
3. Does the new information require an ADR (architectural decision)?
4. Are there tests that validate the behavior you're documenting?

### PR template

When a PR touches docs, it must answer:

- [ ] Which doc or docs have been updated?
- [ ] Are there related schemas that also need changes?
- [ ] Are there behavioral tests validating the documented behavior?
- [ ] If it's a structural decision, does the corresponding ADR exist?
