# Learning Mode

> **Source of truth for:** Learning Mode specification (observation, review, enforcement).
> **NOT the source of truth for:** data schemas (see [`/schemas/baseline.schema.json`](../schemas/baseline.schema.json)).

## Why this document exists

Learning Mode is the component that determines whether AAF achieves real adoption or gets uninstalled in the first week. It is complex and critical enough to merit its own specification.

Traditional security tools fail on day 1 for a consistent reason: the user doesn't know which rules to configure, and defaults are universal rather than contextual. Learning Mode solves this by inverting the order: **AAF first observes the agent's real behavior and then proposes policies**, instead of imposing them.

## The founding hypothesis

> An agent protection system that asks the developer to configure rules before understanding the agent's behavior is condemned to generate false positives on day 1 and be uninstalled by day 3.

This hypothesis translates into a concrete product decision: AAF does not activate enforcement mode until it has observed the agent's normal behavior for 72 hours.

## The three phases of Learning Mode

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   PHASE 1 — OBSERVATION                      (0–72h)     │
│   ──────────────────────                                 │
│   • No blocking                                          │
│   • Passive recording only                               │
│   • Full signal capture                                  │
│                                                          │
│                          ▼                               │
│                                                          │
│   PHASE 2 — REVIEW                           (human)     │
│   ────────────────                                       │
│   • Baseline snapshot                                    │
│   • Dev approves or adjusts policies                     │
│   • Outlier labeling                                     │
│                                                          │
│                          ▼                               │
│                                                          │
│   PHASE 3 — ENFORCEMENT                      (ongoing)   │
│   ──────────────────────                                 │
│   • Active blocking based on policies                    │
│   • Continuous re-learning                               │
│   • Monthly drift detection                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Phase 1 — Observation

### Firewall behavior

During the first 72 hours after integration, AAF operates fully transparently. The agent behaves exactly as it did before integration. No blocking, no approvals, no throttling.

The only operational difference is that each tool call generates an observation event. Added latency in this phase is **under 5ms** and runs asynchronously off the critical path.

### Justification for the 72-hour interval

| Factor                          | Justification                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Temporal coverage               | Covers a full work cycle (includes at least one workday and after-hours)            |
| Statistical variability         | Samples < 48h produce baselines with high variance and unreliable percentiles       |
| Developer patience              | More than 4 days causes abandonment. 72h feels reasonable                           |
| Adjustment by traffic           | If activity is insufficient in 72h, AAF auto-extends to 7 days                      |

### Observation event structure

> The canonical schema lives in [`/schemas/event.schema.json`](../schemas/event.schema.json). This is the TypeScript reference representation.

```typescript
interface ObservationEvent {
  // ── Identity ──────────────────────────────────────
  event_id:                  string;    // uuid v7
  agent_id:                  string;
  session_id:                string;
  timestamp:                 string;    // ISO 8601 with ms precision

  // ── The action ────────────────────────────────────
  tool_name:                 string;    // e.g. "gmail.send"
  tool_namespace:            string;    // e.g. "gmail"
  tool_category:             string;    // "messaging" | "data" | "compute"

  // ── Temporal context ──────────────────────────────
  time_since_last_action_ms:    number;
  time_since_session_start_ms:  number;
  session_action_count:         number;

  // ── Sanitized parameters ──────────────────────────
  recipients:                string[];  // hashed if PII
  payload_hash:              string;    // sha256 of the full body
  payload_embedding?:        number[];  // 384-dim, text only
  payload_size_bytes:        number;
  batch_size:                number;    // 1 if not a batch op

  // ── Post-execution outcome ────────────────────────
  succeeded:                 boolean;
  duration_ms:               number;
  external_response_hash:    string;
}
```

### Why each field matters

| Field                       | Signal it detects                                                              |
| --------------------------- | ------------------------------------------------------------------------------ |
| `time_since_last_action_ms` | Abnormal velocity. A human waits seconds; a runaway agent doesn't.             |
| `payload_embedding`         | Repeated messages without storing the full payload (privacy-first)             |
| `recipients` (hashed)       | Recipient cardinality and patterns without storing PII                         |
| `batch_size`                | Distinguishes single op from mass op (delete 1 vs delete 500)                  |
| `external_response_hash`    | Loops where the agent receives the same response repeatedly                    |
| `tool_category`             | Enables rules by category without enumerating every individual tool            |
| `payload_size_bytes`        | Size outliers that may indicate data exfiltration                              |
| `succeeded`                 | Detects retry storms invisible to success logs                                 |

### Privacy guarantees

- No tool call payload is stored in plaintext. Only hashes and embeddings.
- Recipients are stored hashed (sha256 + local salt).
- Observation data never leaves the developer's device without explicit opt-in.
- After baseline generation, raw events are purged in 7 days by default.

## Building the Behavior Baseline

### Design principle

At the end of the 72 hours, AAF processes all events and builds a Behavior Baseline Document — a complete statistical profile of the agent's normal behavior.

**Key decision: statistics, not fixed thresholds.**

- Absolute thresholds age poorly. "Max 10 emails/hour" may be right today and absurd in three months.
- Percentiles capture the real distribution of behavior and self-adjust as behavior evolves.
- If the p95 of emails sent is 8/hour, AAF can detect 25/hour as anomalous without any pre-configured threshold.

### Behavior Baseline structure

```typescript
interface BehaviorBaseline {
  agent_id: string;

  observation_period: {
    start:           string;
    end:             string;
    total_actions:   number;
  };

  tools: {
    [tool_name: string]: ToolProfile;
  };

  global_patterns: {
    actions_per_session_p50:        number;
    actions_per_session_p95:        number;
    interval_between_actions_p50_ms: number;
    interval_between_actions_p95_ms: number;
    common_tool_sequences:          Sequence[];  // see schemas/common.defs.json#ToolSequence
  };

  confidence: {
    sample_size:       number;
    days_of_data:      number;
    confidence_score:  number;   // 0..1
    weak_signals:      string[]; // tools with < 10 examples
  };
}

interface ToolProfile {
  usage_count: number;

  // Frequency
  calls_per_hour_p50:        number;
  calls_per_hour_p95:        number;
  calls_per_hour_max:        number;

  // Velocity
  min_interval_observed_ms:  number;
  median_interval_ms:        number;

  // Recipients
  recipients_per_call_p50:   number;
  recipients_per_call_p95:   number;
  unique_recipients_total:   number;
  recipient_overlap_rate:    number;

  // Content
  payload_size_p50_bytes:    number;
  payload_size_p95_bytes:    number;
  payload_similarity_p50:    number;
  payload_similarity_max:    number;

  // Batch
  batch_size_p50:            number;
  batch_size_p95:            number;
  batch_size_max:            number;
}
```

### Generating policies from the baseline

**Example:** given the observed baseline for `gmail.send`:

```
Calls/hour p50:         3
Calls/hour p95:         8
Calls/hour max:        12
Min interval:         4.2s
Unique recipients:     47
Similarity p95:       0.34
```

AAF automatically generates:

```yaml
# Auto-generated from 72h observation
# Confidence: 0.87 (based on 234 actions)
gmail.send:
  risk: R2
  rate_limits:
    per_hour: 12          # p95 + 50% margin
    min_interval: 2s      # 2x the minimum interval observed
  anomaly_thresholds:
    unique_recipients_per_hour: 30   # p95 * 2
    payload_similarity: 0.65         # p95 + 0.3
  require_approval:
    when:
      - batch_size: { gt: 20 }
      - calls_in_last_hour: { gt: 25 }
```

### Multipliers applied to the baseline

Multipliers are deliberately conservative (tolerant). The product prioritizes minimizing false positives over maximizing theoretical protection.

| Dimension                       | Multiplier     | Justification                                            |
| ------------------------------- | -------------- | -------------------------------------------------------- |
| Per-hour rate limit             | p95 + 50%      | Tolerates legitimate peaks. Only blocks blowouts         |
| Minimum interval                | min × 0.5      | Allows reasonable bursts, blocks superhuman speed        |
| Unique recipients / hour        | p95 × 2        | Very generous, only catches mass-blast explosions        |
| Payload similarity              | p95 + 0.3      | Detects obvious repetition without alarming on templates |
| Maximum batch size              | p95 × 2        | Distinguishes normal batch from mass operation           |
| Actions per session             | p95 × 1.5      | Tolerates legitimately long sessions                     |

## Phase 2 — Review

### Trigger

When the 72 hours are reached, AAF fires a notification through the configured channel (Slack by default in MVP):

```
🔔 AAF — Your agent has been observed

I've observed AntonioBot's behavior for 72h.
I've recorded 234 actions and built a profile of
normal behavior.

Before activating active protection, I need your review.
This will take about 3 minutes.

  [Review now]   [Remind me in 1h]
```

### Review screen structure

The screen has three sequential sections. The order is deliberate: start with the narrative summary (builds trust), move to technical policies (allows adjustment), and finish with outliers (labeling of edge cases).

#### Section 1 — Narrative summary

LLM-generated paragraph from the baseline. Goal: in 15 seconds, the developer understands what AAF has learned.

> Over the last 72 hours, your agent AntonioBot:
> - Sent 87 emails (3.2 per hour on average, peaks of 8)
> - Contacted 47 unique people, with 12% follow-ups
> - Connected with 23 contacts on LinkedIn
> - Queried your CRM 412 times
> - Never deleted data or transferred funds
>
> The pattern is consistent with an outbound sales agent during work hours.

#### Section 2 — Recommended policies

Each policy as an interactive card with:

- ✅ Approve / reject toggle
- 🔧 Threshold adjustment slider
- 📊 Mini-chart showing how the rule sits against observed activity
- 💬 Natural-language explanation ("I'll block sends to more than 30 unique recipients in one hour")
- 📝 Expandable justification ("Generated from 47 sends, p95 = 15, threshold = p95 × 2")

#### Section 3 — Detected outliers

3–5 events detected during observation worth human review. Feedback feeds into the Phase 3 detector.

> I detected 3 unusual moments you may want to review:
>
> 🟡 Tuesday 14:23 — 14 emails in 12 minutes to distinct recipients. Was this expected? [Normal] [Anomalous]
>
> 🟡 Wednesday 09:45 — same message sent to 5 people (similarity 0.91). Template or unintended repetition? [Template] [Anomalous]
>
> 🟡 Thursday 18:30 — activity outside usual hours. Should the agent run at this time? [Yes, 24/7] [Work hours only]

### Review outcome

AAF generates `firewall.yml` that the dev can inspect, version in git, and modify manually. It also saves outlier labels as training examples.

**Dashboard path (opt-in):** developers may upload baseline JSON via the Pro dashboard (`POST /api/v1/learning/baseline`) for template-based review. Raw observation events are not synced unless explicitly included in the upload payload.

## Phase 3 — Enforcement with continuous learning

### Continuous learning mechanism

```typescript
class ContinuousLearner {
  // Each successful action expands the baseline
  onActionAllowed(event: ActionEvent) {
    this.baseline.update(event, weight: 1.0);
  }

  // False positive: strong signal of miscalibrated threshold
  onFalsePositiveReported(event: ActionEvent) {
    this.baseline.update(event, weight: 3.0);
    this.policyTuner.relaxThreshold(
      event.tool_name,
      event.violation_type
    );
  }

  // Confirmed block: threshold is correct
  onBlockConfirmed(event: BlockEvent) {
    this.policyTuner.confirmThreshold(event.tool_name);
  }

  // Monthly rebaseline
  async monthlyRebaseline() {
    const recentBaseline = await this.computeBaseline(days: 30);
    await this.notifyDevOfDrift(recentBaseline);
  }
}
```

### Drift detection

Every 30 days, AAF compares the current baseline against the originally approved one.

| Drift type                  | Example                                              | AAF action                  |
| --------------------------- | ---------------------------------------------------- | --------------------------- |
| Volume increase             | Emails/h rose from 3 to 9 in 30 days                 | Notify and ask              |
| New recipients              | % of new recipients > 60% of baseline                | Notify                      |
| Temporal pattern shift      | Nighttime activity where there was only daytime      | Notify                      |
| New tools                   | Tool not present in the baseline                     | Block until review          |
| Sustained velocity          | Mean interval dropped 70%                            | Notify                      |
| Batch size                  | Batch size p95 doubled                               | Notify                      |

## Edge cases

### Case 1 — Very low traffic

If there are fewer than 50 actions in 72h, baseline confidence is low (`confidence_score < 0.6`). AAF detects this and offers:
- Extend observation to 7 days
- Apply pre-built policies for the declared agent category

### Case 2 — Variable temporal traffic

Detect gaps > 4h without activity. Exclude them from velocity baseline calculation. Document in baseline: "Active only during work hours Mon–Fri 9–19".

### Case 3 — Legitimate extreme behavior

A legitimate agent may send 200 emails/day. The baseline observes — it doesn't assume "reasonable". If p95 = 25/hour, policies are proportional.

### Case 4 — Strict Mode

For devs who don't want to wait 72h. Applies pre-built conservative policies from the start, observes in parallel, offers to relax to the real baseline at 72h.

### Case 5 — Re-learning after update

Detect changes in system prompt or tools. Notify: "Want to re-learn the baseline?". A 72h re-observation window with temporarily relaxed policies.

## Success metrics

| Metric                          | Definition                                                         | MVP target   |
| ------------------------------- | ------------------------------------------------------------------ | ------------ |
| Policy acceptance rate          | % of devs activating enforcement without editing generated policies| > 60%        |
| False positive rate             | % of blocked actions flagged as legitimate (first week)            | < 5%         |
| Time to First Value (TTFV)      | Time from install to first real incident prevented                 | < 30 days    |

### Cross-diagnosis

| Observed pattern             | Diagnosis                                                | Action                       |
| ---------------------------- | -------------------------------------------------------- | ---------------------------- |
| High acceptance + high FP    | Policies approved but too strict                         | Increase multipliers         |
| Low acceptance + low FP      | Devs tweak a lot but final policies work                 | Improve review UI            |
| High TTFV + low FP           | Product isn't protecting enough                          | Review Layer 3 detector      |
| High acceptance + high TTFV  | Policies accepted but not detecting incidents            | Review baseline coverage     |

## Evolution roadmap

- **Evolution 1 — Trained ML detector:** replace heuristics with ML model trained on real beta data.
- **Evolution 2 — Shared baselines by category:** with enough baselines, offer pre-calibrated baselines per agent category.
- **Evolution 3 — Malicious agent detection:** patterns typical of compromised agents detectable via collective intelligence.

## References

- ADR-0004: [72h observation window](../adrs/0004-observation-window.md)
- Schema: [`/schemas/baseline.schema.json`](../schemas/baseline.schema.json) — includes `ToolSequence` definition in `common.defs.json`
- Schema: [`/schemas/event.schema.json`](../schemas/event.schema.json)
- Behavioral tests: [`/packages/core/test/behavioral/`](../packages/core/test/behavioral/) (enforcement layers — Paso 3a spec; Learning Mode tests deferred)
