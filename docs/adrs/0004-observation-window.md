# ADR-0004: 72h observation window in Learning Mode

## Status

Accepted · 2026-06-06

## Context

AAF's founding hypothesis: a protection system that asks developers to configure rules before understanding agent behavior generates false positives on day 1 and gets uninstalled by day 3. Learning Mode inverts this — observe first, enforce later.

The observation window length trades statistical confidence against developer patience. Too short produces unreliable baselines; too long causes abandonment before enforcement activates.

## Decision

**Default observation window: 72 hours** from first firewall integration.

During observation:
- No blocking, approvals, or throttling.
- Every tool call emits an observation event (see [`schemas/event.schema.json`](../../schemas/event.schema.json)).
- Added latency target: **under 5ms**, asynchronous off the critical path.

**Automatic extension:** if activity is insufficient to build a reliable baseline within 72h, AAF extends observation up to **7 days** automatically. The developer is notified when extension occurs.

Configurable override: `learning_mode.observation_hours` in `firewall.yml` (minimum 24, maximum 168).

## Practical application

| Factor                  | 72h justification                                      |
| ----------------------- | ------------------------------------------------------ |
| Temporal coverage       | At least one full workday + after-hours cycle          |
| Statistical variability | < 48h produces high-variance percentiles               |
| Developer patience      | > 4 days risks abandonment; 72h feels reasonable       |
| Low-traffic agents      | Auto-extend to 7d rather than enforce on weak baseline |

After observation, Phase 2 (Review) presents baseline and proposed policies. Enforcement (Phase 3) begins only after developer approval.

## Consequences

### Positive

- Baselines grounded in real behavior, not universal defaults.
- Reduces day-1 false positives — primary adoption risk.
- Extension handles low-traffic agents without manual configuration.

### Negative

- 72h window leaves agent unprotected against runaway behavior during observation.
- Developers expecting immediate protection may be surprised.

### Mitigations

- Clear onboarding messaging: observation is intentional, not a bug.
- Optional "skip learning mode" for experienced users (requires explicit config + warning).
- Document the trade-off in [`learning-mode.md`](../learning-mode.md).

## Alternatives considered

### A. 48h window

Rejected. Insufficient for reliable p95 percentiles on variable agent workloads.

### B. 7 days default

Rejected. Too long for MVP adoption; developers abandon before review.

### C. Fixed action count instead of time

Rejected as sole metric. Action count alone ignores temporal patterns (work hours, bursts). Used as supplementary signal for extension, not replacement.

## References

- [Learning Mode](../learning-mode.md)
- [Schema: baseline.schema.json](../../schemas/baseline.schema.json)
- [Schema: event.schema.json](../../schemas/event.schema.json)
