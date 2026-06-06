# ADR-0003: YAML for policies

## Status

Accepted · 2026-06-06

## Context

AAF policies (`firewall.yml`) define tool risk tiers, rate limits, anomaly thresholds, and approval behavior. Developers must read, edit, version in git, and review policies in PRs. Learning Mode auto-generates policies from a 72h baseline — the output must be human-inspectable.

Alternatives: JSON (machine-friendly but verbose), TOML (less common in DevOps), or a custom DSL (powerful but high learning curve and tooling cost).

## Decision

**Policies are authored and stored as YAML files** named `firewall.yml` (or paths referenced in `Firewall` config).

- The canonical shape is defined by [`schemas/policy.schema.json`](../../schemas/policy.schema.json).
- Runtime validation MUST reject invalid policies at load time.
- JSON representation is permitted **only** for test fixtures and programmatic generation — not as the primary developer-facing format.

## Practical application

```yaml
# firewall.yml — valid against policy.schema.json
version: "1"
tools:
  gmail.send:
    risk: R2
anomaly_detection:
  enabled: true
```

- CLI: `aaf policy validate ./firewall.yml` (Paso 2+)
- Learning Mode generates YAML, not JSON, for developer review.
- Policy reference docs explain sections in prose; exact fields live in the schema.

## Consequences

### Positive

- Comments allowed in policy files (critical for auto-generated Learning Mode output).
- Familiar format for DevOps/security teams (Kubernetes, GitHub Actions).
- Diff-friendly in code review.

### Negative

- YAML ambiguity (tabs, implicit typing) requires strict schema validation.
- Two representations if fixtures use JSON — mitigated by limiting JSON to tests.

### Mitigations

- Validate every policy load with AJV against `policy.schema.json`.
- Provide example fixtures and `schemas/validate.mjs` for local checks.
- Document common YAML pitfalls in [`docs/policies/reference.md`](../policies/reference.md).

## Alternatives considered

### A. JSON only

Rejected. No comments. Harder for developers to annotate auto-generated policies.

### B. Custom DSL

Rejected for MVP. High tooling cost (parser, linter, IDE support). YAML + schema achieves 90% of the benefit.

### C. TOML

Rejected. Less familiar in the JavaScript/AI agent ecosystem than YAML.

## References

- [Risk tiers — Classification rules](../concepts/risk-tiers.md)
- [Learning Mode — Generating policies](../learning-mode.md)
- [Schema: policy.schema.json](../../schemas/policy.schema.json)
