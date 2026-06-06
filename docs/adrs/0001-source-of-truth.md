# ADR-0001: Source of truth for the product

## Status

Accepted · 2026-06-06

## Context

The product has initial specifications in Word documents (`agent_action_firewall_techdoc.docx`, `aaf_learning_mode_techdoc.docx`) useful for communicating with non-technical stakeholders but not executable or usefully versionable for development.

Without a clear source of truth, the risks are concrete:

- Word docs diverge from the code without anyone noticing.
- A dev adds a feature; the doc is not updated; the next dev reads the doc and builds on outdated assumptions.
- Technical decisions are made in conversations and lost.
- Tests and spec contradict each other with no resolution mechanism.

## Decision

We adopt a 5-level hierarchy where the lower level wins in case of conflict:

1. **Intent (Word, Notion, decks)** — The product's *why*. Audience: stakeholders, investors, non-technical team.
2. **Specification (`/docs/*.md`)** — *What* the product does. Audience: devs, contributors.
3. **Contracts (`/schemas/*.json`)** — *How* it formally looks. Programmatically validatable.
4. **Behavior (tests)** — What it does *exactly*. Tests ARE the executable spec.
5. **Code (`/packages/*`)** — Implementation.

**Conflict rule:** if there's disagreement between levels, the lower level wins. Code is more authoritative than spec; spec is more authoritative than Word doc.

## Practical application

| Decision type                                | Lives in                                  | DO NOT duplicate in                |
| -------------------------------------------- | ----------------------------------------- | ---------------------------------- |
| Value proposition, business model            | `docs/overview.md` + stakeholder Word     | The code                           |
| Layer architecture, principles               | `docs/architecture.md`                    | Extensive code comments            |
| R1–R4 definition                             | `docs/concepts/risk-tiers.md`             | Multiple docs                      |
| Exact format of `firewall.yml`               | `schemas/policy.schema.json`              | Prose in docs                      |
| `BehaviorBaseline` structure                 | `packages/core/src/types.ts` + schema     | Word, README                       |
| Behavior "block if similarity > 0.92"        | `test/behavioral/repetition.test.ts`      | Only prose in docs                 |
| Technical decisions with tradeoffs           | ADRs in `docs/adrs/`                      | Team memory, Slack                 |
| Commercial roadmap, pricing                  | `docs/overview.md` + stakeholder Word     | The code                           |

## Consequences

### Positive

- Every decision has a clear owner and a single place where it's updated.
- When someone asks "does this block or not?", the answer is to run the test, not to read a paragraph.
- Word docs remain useful for non-technical audiences without polluting the codebase.
- Disagreements between devs about behavior are resolved with tests, not arguments.

### Negative

- More discipline required in code review: a PR that changes behavior without updating tests and relevant docs must be rejected.
- Possible initial fragmentation: new contributors need to understand the hierarchy before contributing.
- More upfront work: creating schemas and ADRs before coding feels slow, but saves months of divergence.

### Mitigations

- Clear README explaining the hierarchy and where to find each thing.
- PR template that asks "which docs did you update?".
- Doc linter (future): verifies that cross-doc references don't break.

## Alternatives considered

### A. Keep Word as primary source

Rejected. Word isn't executable, isn't diffable in a useful way, doesn't enable robust cross-component links.

### B. A single source: the code

Rejected. The product's "why" and business decisions don't fit in code. The hierarchy exists because different audiences need different representations.

### C. Notion as primary source

Rejected. Vendor lock-in. Doesn't live in the repo. Doesn't participate in code review. Doesn't survive project exits.

### D. GitHub Wiki

Rejected. Better than Notion but worse than `/docs/*.md`. Doesn't participate in PRs or branches. Not portable.

## Notes

- The original Word docs (`agent_action_firewall_techdoc.docx`, `aaf_learning_mode_techdoc.docx`) are kept as historical artifacts and for communication with non-technical stakeholders. Their technical content has been migrated to `/docs/*.md` (this repository).
- When Word docs diverge from Markdown docs, Markdown wins.
- Words can be regenerated from Markdown at any time if a printable version is needed.

## References

- [Documentation Architecture (Divio)](https://documentation.divio.com/) — inspiration for the structure
- [Original ADR pattern (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html)
