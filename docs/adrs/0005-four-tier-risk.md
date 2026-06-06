# ADR-0005: 4-tier risk structure (R1–R4)

## Status

Accepted · 2026-06-06

## Context

Layer 1 classifies every tool call into a risk tier that drives approval behavior (Layer 4) and default policy generation (Learning Mode). The tier count must balance granularity against developer cognitive load.

Too few tiers lump irreversible deletes with reversible reads. Too many tiers create ambiguity and configuration fatigue.

## Decision

AAF uses exactly **four risk tiers**:

| Tier | Name       | Default behavior                          |
| ---- | ---------- | ----------------------------------------- |
| R1   | Low        | Auto-approve, log only                    |
| R2   | Medium     | Notify + cancellation window (default 30s) |
| R3   | High       | Block until explicit approval             |
| R4   | Critical   | Block + MFA; **not relaxable** without admin override |

**Classification order:**
1. Static rules in `firewall.yml` (tool name + optional `when` conditions)
2. Contextual escalation (e.g., `gmail.delete` with `batch_size > 10` → escalate to R4)
3. LLM classifier fallback for uncatalogued tools only — result cached by `(tool_name, parameter_shape)`

**R4 is never relaxable** in default or generated policies. Admin override requires additional authentication.

## Practical application

- Tier enum is fixed in [`schemas/common.defs.json`](../../schemas/common.defs.json) as `RiskTier`.
- Policies MUST NOT define custom tier names (R5, "custom-high", etc.).
- Paranoid mode raises default behavior one tier (R1 → notify, R2 → block) without changing tier assignment.
- Canonical definitions: [`concepts/risk-tiers.md`](../concepts/risk-tiers.md).

## Consequences

### Positive

- Maps cleanly to approval gate behavior.
- Developers can reason about four levels without a lookup table of dozens.
- Escalation rules handle edge cases without adding tiers.

### Negative

- Some actions sit at tier boundaries (e.g., delete 1 email vs 500).
- LLM fallback introduces variability for uncatalogued tools.

### Mitigations

- Contextual escalation rules in YAML for boundary cases.
- Aggressive caching of LLM classification results.
- Conservative LLM prompt: "when in doubt, choose the higher tier."

## Alternatives considered

### A. 3 tiers

Rejected. R3 would mix "delete one email" with high-stakes operations; insufficient separation for approval behavior.

### B. 5+ tiers

Rejected. Ambiguity for developers; diminishing returns on approval differentiation.

### C. Per-tool numeric scores (0–100)

Rejected for MVP. Harder to configure, explain, and map to approval UX. Possible future extension behind tier abstraction.

## References

- [Risk tiers (R1–R4)](../concepts/risk-tiers.md)
- [Architecture — Layer 1](../architecture.md)
- [Schema: policy.schema.json](../../schemas/policy.schema.json)
