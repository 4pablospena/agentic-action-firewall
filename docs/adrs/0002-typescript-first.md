# ADR-0002: TypeScript as primary language

## Status

Accepted · 2026-06-06

## Context

AAF must integrate with multiple agent frameworks (LangChain, Claude SDK, OpenAI Agents, custom wrappers) while maintaining a framework-agnostic core. The team needs a single primary runtime for the hot path (firewall pipeline, audit log, anomaly detection) with predictable latency and a broad npm ecosystem.

Python is dominant in the LangChain/CrewAI community. Some contributors will expect a Python SDK. The question is whether to treat both languages as co-equal or designate one as primary with parity as secondary.

## Decision

**TypeScript on Node.js 22 LTS is the primary language** for:

- `@agent-firewall/core` and all MVP wrappers (LangChain JS, Claude SDK, OpenAI Agents)
- JSON Schema contracts in `/schemas/`
- Generated TypeScript types from schemas (Paso 2)
- CLI (`aaf`)

**Python 3.12 is secondary**, providing API parity for LangChain/CrewAI users in Phase 1. Python packages mirror the TypeScript core API but are not the source of truth for contracts or behavior tests.

## Practical application

| Artifact              | Primary language | Notes                                      |
| --------------------- | ---------------- | ------------------------------------------ |
| Core firewall engine  | TypeScript       | Framework-agnostic, zero Vue/Nuxt deps       |
| JSON Schemas          | Language-agnostic| Validated by AJV; types generated to TS      |
| Behavioral tests      | TypeScript       | Vitest; executable spec per ADR-0001       |
| Python wrapper        | Python 3.12      | Parity with core; follows TS test behavior |
| Dashboard             | TypeScript/Vue   | Nuxt 3 in `apps/dashboard/` — Phase 1      |

## Consequences

### Positive

- Single hot-path implementation with sub-200ms p95 target.
- Shared types between core, wrappers, and dashboard via `@agent-firewall/core`.
- JSON Schema → TypeScript generation keeps contracts and compile-time types aligned.

### Negative

- Python users wait for Phase 1 parity package.
- Two implementations to maintain long-term for Python parity.

### Mitigations

- Behavioral tests in TypeScript define exact behavior; Python must pass equivalent tests.
- Schemas are language-agnostic — both runtimes validate against the same contracts.

## Alternatives considered

### A. Python as primary

Rejected. Most agent SDK wrappers targeted for MVP (Claude SDK, OpenAI Agents) are TypeScript-first. Dashboard stack is Nuxt/TypeScript. Splitting primary runtime would fragment the hot path.

### B. Rust for core performance

Rejected for MVP. Adds build complexity and slows iteration. TypeScript meets the 200ms p95 target with heuristics-first Layer 3. Revisit only if benchmarks prove insufficient.

### C. Dual primary (TS + Python from day 1)

Rejected. Doubles MVP scope. Python parity deferred to Phase 1 per roadmap.

## References

- [Architecture — Technology stack](../architecture.md)
- [ADR-0001: Source of truth](./0001-source-of-truth.md)
