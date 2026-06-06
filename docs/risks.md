# Product risk analysis

> **Source of truth for:** product and project risks, likelihood, impact, and mitigations.
> **NOT the source of truth for:** technical architecture — see [`architecture.md`](./architecture.md).

Summary referenced from [`overview.md`](./overview.md#main-risks).

## Risk matrix

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Latency degrades agent experience | Medium | High | 200ms p95 budget; per-layer targets; continuous benchmarks in `bench/` |
| False positives block legitimate actions | Medium | High | Learning Mode 72h baseline; conservative multipliers; user false-positive feedback loop |
| Cloud providers ship equivalent | High | Medium | Time-to-market advantage; multi-framework support; open core moat |
| Slow open source adoption | Medium | High | Docs, reproducible incident demos, Show HN / DevRel (Phase 0b) |
| EU AI Act delayed or diluted | Low | Medium | Product value independent of regulation; audit log useful for GDPR and litigation |
| Schema/code drift | Medium | High | Source-of-truth hierarchy; ADRs for contract changes; `schemas/validate.mjs` |
| Security audit findings pre-launch | Medium | High | External audit in Phase 0b; fail-safe defaults (block on firewall error) |

## Latency risk

**Problem:** A 5-layer pipeline on every tool call adds overhead. Agents are latency-sensitive; developers will remove AAF if it noticeably slows agents.

**Mitigation:**

- Target: **under 200ms p95** total pipeline
- Layer budgets: L1 ~30ms, L2 ~5ms, L3 ~80ms, L5 ~10ms, L4 variable (human)
- Learning Mode observation: under 5ms async off critical path
- No external network calls in Layer 3 hot path ([ADR-0006](./adrs/0006-heuristics-first.md))
- Benchmarks required for any hot-path change

## False positive risk

**Problem:** Blocking legitimate agent actions causes immediate uninstall. This is the primary adoption failure mode.

**Mitigation:**

- Learning Mode observes 72h before enforcement ([ADR-0004](./adrs/0004-observation-window.md))
- Baseline-derived thresholds with generous multipliers (p95 + 50%, etc.)
- Detector prefers false positives over false negatives — compensated by calibration
- MVP target: < 5% false positive rate in first week (100+ users)
- Continuous learning: false positives weighted 3× in baseline updates

## Competitive risk

**Problem:** AWS Bedrock Guardrails, Azure AI Content Safety, or Google could add action-layer protection.

**Mitigation:**

- First-mover in action-layer category (not text guardrails)
- Multi-framework: LangChain, Claude SDK, OpenAI Agents, custom — not provider-locked
- Open core MIT: viral adoption before incumbents ship
- Behavioral anomaly detection (Layer 3) as differentiator vs pointwise tool inspection

## Adoption risk

**Problem:** Developers won't integrate another dependency without clear ROI.

**Mitigation:**

- < 5 lines integration (`Firewall.wrap(tools)`)
- Reproducible demos: OpenClaw Gmail deletion, LangChain $47K loop
- Published external security audit (Phase 0b)
- Content marketing: post-mortems of public agent incidents

## Regulatory risk

**Problem:** EU AI Act timing or scope changes reduce compliance-driven demand.

**Mitigation:**

- Core value (prevent runaway agents) exists without regulation
- Audit log serves GDPR, litigation, and internal security — not only EU AI Act
- Enterprise positioning as compliance accelerator, not compliance-only product

## Technical debt risk

**Problem:** Pre-alpha specs diverge from implementation as coding accelerates.

**Mitigation:**

- Contracts closed in Paso 1: schemas + ADRs before `packages/core/`
- Tests are executable spec (level 4) — behavioral tests before implementation
- PR template requires doc/schema/test updates

## References

- [Product overview](./overview.md)
- [Architecture — Design philosophy](./architecture.md)
- [Learning Mode](./learning-mode.md)
- [Source of truth hierarchy](./adrs/0001-source-of-truth.md)
