# AAF JSON Schemas

> **Level 3 — Contracts** in the [source-of-truth hierarchy](../docs/adrs/0001-source-of-truth.md).
> If a doc and a schema disagree, the schema wins until an ADR explicitly evolves it.

## Schemas

| File | Purpose | Spec |
| ---- | ------- | ---- |
| [`common.defs.json`](./common.defs.json) | Shared `$defs` (RiskTier, ToolName, etc.) | ADRs 0005, 0007 |
| [`policy.schema.json`](./policy.schema.json) | `firewall.yml` validation | [policies/reference.md](../docs/policies/reference.md) |
| [`event.schema.json`](./event.schema.json) | Learning Mode observation events | [learning-mode.md](../docs/learning-mode.md) |
| [`baseline.schema.json`](./baseline.schema.json) | Behavior baseline output | [learning-mode.md](../docs/learning-mode.md) |
| [`audit-entry.schema.json`](./audit-entry.schema.json) | Immutable audit log records | [audit-log.md](../docs/concepts/audit-log.md) |
| [`anomaly-result.schema.json`](./anomaly-result.schema.json) | Layer 3 detector output | [anomaly-detection.md](../docs/concepts/anomaly-detection.md) |

## Fixtures

Example documents in [`fixtures/`](./fixtures/) including incident scenarios:

- **OpenClaw** — `gmail.delete` mass action in policy + observation event + audit entry
- **LangChain $47K** — tool loop in `anomaly-result.loop.example.json`

## Local validation

From the repository root:

```bash
pnpm install
pnpm validate:schemas
```

Or from this directory:

```bash
pnpm validate
```

Uses AJV 2020-12 with `ajv-formats`. YAML policies are parsed with `js-yaml` before validation.

## Evolution policy

Changing a schema is a **contract change**. Required steps:

1. Open or update an ADR explaining the change.
2. Update the schema and fixtures.
3. Update behavioral tests (when they exist).
4. Run `pnpm validate:schemas` — must pass before merge.

Do not change schemas silently to match implementation drift.

## Known design notes

- **Audit `arguments` vs privacy:** `tool_call.arguments` holds sanitized primitives only; `arguments_hash` (SHA-256 of full payload) is required. See ADR-0007.
- **`ToolSequence`:** Defined in `common.defs.json` as `{ tools, count, frequency_p50 }` — referenced from `baseline.schema.json`.
- **Policy `when` + `escalate_to`:** When conditions match, tier escalates to `escalate_to` instead of base `risk`.

## References

- [ADR-0003: YAML for policies](../docs/adrs/0003-yaml-for-policies.md)
- [ADR-0005: 4-tier risk structure](../docs/adrs/0005-four-tier-risk.md)
- [ADR-0007: Ed25519 signing](../docs/adrs/0007-ed25519-signing.md)
