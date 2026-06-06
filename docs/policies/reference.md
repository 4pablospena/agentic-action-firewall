# Policy reference (`firewall.yml`)

> **Source of truth for:** human-readable explanation of policy sections and escalation rules.
> **NOT the source of truth for:** exact field validation — see [`schemas/policy.schema.json`](../../schemas/policy.schema.json).

## Overview

AAF policies are YAML files (default: `firewall.yml`) validated at load time against the JSON Schema contract. See [ADR-0003: YAML for policies](../adrs/0003-yaml-for-policies.md).

```typescript
const firewall = new Firewall({ policies: './firewall.yml' });
```

Learning Mode auto-generates policies after the 72h observation window. Developers can edit, version in git, and override any field.

## Document structure

| Section | Purpose |
| ------- | ------- |
| `version` | Schema version. Must be `"1"`. |
| `learning_mode` | Observation window before enforcement. Default 72h ([ADR-0004](../adrs/0004-observation-window.md)). |
| `tools` | Per-tool risk tier, rate limits, and approval conditions. |
| `anomaly_detection` | Layer 3 pattern toggles and thresholds. |
| `approval` | Tier-based approval behavior (Layer 4). |
| `budget` | Session cost cap (Layer 2). |

Full example: [`schemas/fixtures/firewall.example.yml`](../../schemas/fixtures/firewall.example.yml).

## Risk tiers (`tools`)

For canonical tier definitions, see [`concepts/risk-tiers.md`](../concepts/risk-tiers.md) and [ADR-0005](../adrs/0005-four-tier-risk.md).

```yaml
tools:
  gmail.send:
    risk: R2

  gmail.delete:
    risk: R3
    when:
      batch_size:
        gt: 10
    escalate_to: R4

  stripe.charge:
    risk: R4    # always critical, not relaxable
```

### Escalation

- Base `risk` applies when no `when` condition matches.
- When `when` conditions match, tier escalates to `escalate_to`.
- **OpenClaw scenario:** `gmail.delete` with `batch_size > 50` should trigger `require_approval` and mass-action detection.

### Rate limits

```yaml
  gmail.send:
    risk: R2
    rate_limits:
      per_hour: 20
      min_interval: 6s
      per_recipient_24h: 3
      per_session: 100
```

Intervals use suffixes: `ms`, `s`, `m`, `h`.

### Conditional approval

```yaml
  gmail.send:
    require_approval:
      when:
        - batch_size:
            gt: 20
        - calls_in_last_hour:
            gt: 25
```

## Anomaly detection

Pattern configuration mirrors [`concepts/anomaly-detection.md`](../concepts/anomaly-detection.md). Thresholds can be calibrated from Learning Mode baseline.

```yaml
anomaly_detection:
  enabled: true
  patterns:
    mass_action:
      enabled: true
      threshold_per_minute: 50
      action: pause_and_snapshot
    loop:
      enabled: true
      max_occurrences: 3
      window_seconds: 60
```

**LangChain $47K scenario:** enable `loop` detection with default thresholds.

## Approval defaults

```yaml
approval:
  r1: auto_allow          # or notify (paranoid mode)
  r2:
    cancel_window_seconds: 30   # 0–120
  r4:
    require_mfa: true
    relaxable: false            # must be false — ADR-0005
```

R3 always requires explicit approval (not configurable to auto-allow).

## Budget

```yaml
budget:
  max_cost_per_session_usd: 5
```

Mitigates runaway token spend (LangChain multi-agent incident).

## Validation

```bash
cd schemas
npm install
npm run validate
```

Future CLI: `aaf policy validate ./firewall.yml` (Paso 2).

## Common YAML pitfalls

- Use spaces, not tabs.
- Quote values that YAML might interpret as booleans or numbers incorrectly.
- Tool names must match `namespace.action` pattern (e.g., `gmail.send`, not `GmailSend`).

## References

- [Schema: policy.schema.json](../../schemas/policy.schema.json)
- [Risk tiers](../concepts/risk-tiers.md)
- [Anomaly detection](../concepts/anomaly-detection.md)
- [Learning Mode](../learning-mode.md)
