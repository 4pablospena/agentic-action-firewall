# Anomaly detection (Layer 3)

> **Source of truth for:** detected patterns, heuristic algorithms, future ML detector specification.
> **NOT the source of truth for:** exact thresholds (those live in user YAML policies, generated from the Learning Mode baseline).

## Why this layer exists

Layers 1 (classification) and 2 (rate limiting) detect obvious violations: a high-tier action, too many actions per hour. But real documented incidents (OpenClaw, LangChain $47K) don't violate obvious rules — they emerge from behavioral patterns that are individually acceptable but aggregately aberrant.

Layer 3 is the core detector of the product. It's where the differential value lies against existing guardrail tools.

## Detected patterns

| Pattern                       | Detection algorithm                                                            | Default action                 |
| ----------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| Repeated message              | Cosine similarity > 0.92 between embeddings of last N actions                  | Block if > 5 recipients        |
| Tool loop                     | Same tool-call sequence observed 3+ times in 60s                               | Exponential throttle           |
| Recipient escalation          | Recipient list grows > 10x relative to session baseline                        | Block + notify                 |
| Scope drift                   | Agent calls tools outside the initially declared scope                         | Block + require approval       |
| Superhuman velocity           | > 1 external action every 3 seconds sustained for > 1 min                      | Throttle to human velocity     |
| Mass actions                  | Delete/modify operations on > 50 items in < 60s                                | Pause + snapshot + approval    |

## Heuristic algorithms (MVP)

### Repeated message

**Goal:** detect spam — the same message sent to multiple recipients or repeatedly.

**Input:** current action payload + window of last N actions for the same tool.

**Algorithm:**

1. Compute embedding of the current payload (384-dim, Voyage-3-lite or text-embedding-3-small).
2. Compare with embeddings of the last 20 actions of the same tool in the same session.
3. Compute maximum cosine similarity.
4. If `max_similarity > threshold_repetition` (default 0.92, adjustable from baseline): **anomaly detected**.

**Output:**

```typescript
{
  detected: true,
  severity: "high",
  confidence: 0.94,
  reason: "Payload similarity 0.94 with action 3 minutes ago to different recipient",
  suggested: "block_if_more_than_5_recipients"
}
```

### Tool loop

**Goal:** detect pipelines stuck in loops (the LangChain $47K case).

**Input:** temporal window of tool calls.

**Algorithm:**

1. Take last 60s of agent tool calls.
2. Look for repeated sequences using sliding window of length 2–5.
3. If the same sequence appears 3+ times: **anomaly detected**.

**Output:** suggest exponential throttle (each new occurrence doubles the delay).

### Superhuman velocity

**Goal:** detect agents acting faster than humanly plausible.

**Input:** timestamps of the last external (R2+) actions.

**Algorithm:**

1. Compute mean interval between external actions in the last 60s window.
2. If `mean_interval < 3s` sustained for > 1 minute: **anomaly detected**.

**Note:** this threshold is default. It can be overridden by baseline if the agent legitimately acts fast (e.g., batch processing agent).

### Mass actions

**Goal:** prevent the OpenClaw case — runaway mass deletes.

**Input:** current action + counter of same-type actions in last window.

**Algorithm:**

1. If `tool_category == "destructive"` (delete, modify, drop): increment counter.
2. If `count > 50` in < 60s: **critical anomaly detected**.
3. Pause all actions of the same tool. Generate state snapshot. Notify user.

### Recipient escalation

**Goal:** detect agents that start contacting few people and suddenly contact many (misconfigured campaigns).

**Input:** baseline of unique recipients per hour + current.

**Algorithm:**

1. Compute unique recipients in the last hour.
2. If `current > baseline_p95 * 10`: **anomaly detected**.

### Scope drift

**Goal:** detect agents using tools that weren't part of their declared scope.

**Input:** current tool + list of tools observed during the 72h learning mode.

**Algorithm:**

1. If `current_tool not in observed_tools`: **anomaly detected**.
2. Action: block and ask for explicit approval before allowing the first use.

## Detector result structure

> The canonical schema lives in [`/schemas/anomaly-result.schema.json`](../../schemas/anomaly-result.schema.json) (pending).

```typescript
interface AnomalyResult {
  detected:    boolean;
  severity:    "low" | "medium" | "high" | "critical";
  confidence:  number;       // 0..1
  pattern:     PatternType;  // which pattern triggered
  reason:      string;       // human-readable
  suggested:   Action;       // throttle | block | approve
  evidence: {
    events:    string[];     // IDs of relevant events
    metrics:   Record<string, number>;
  };
}

type PatternType =
  | "repetition"
  | "loop"
  | "speed"
  | "mass_action"
  | "recipient_escalation"
  | "scope_drift";

type Action =
  | { type: "allow" }
  | { type: "throttle"; delay_ms: number }
  | { type: "block"; require_approval: boolean }
  | { type: "kill_session"; reason: string };
```

## Configurability

Each pattern is individually:

- **Enable/disable** in YAML policies
- **Calibratable** (thresholds adjustable from Learning Mode baseline)
- **Action configurable** (block vs throttle vs approve)

Example in `firewall.yml`:

```yaml
anomaly_detection:
  enabled: true

  patterns:
    repetition:
      enabled: true
      threshold: 0.92          # cosine similarity
      action_if_recipients_gt: 5

    loop:
      enabled: true
      sequence_min_length: 2
      window_seconds: 60
      max_occurrences: 3

    speed:
      enabled: true
      max_per_second: 0.33     # 1 action every 3s

    mass_action:
      enabled: true
      threshold_per_minute: 50
      action: "pause_and_snapshot"
```

## ML detector (Phase 1)

The MVP heuristic detector is replaced in Phase 1 by a model trained on real data collected during the beta.

### Training pipeline

1. **Collection:** opt-in anonymous telemetry from MVP beta users.
2. **Labeling:** user-confirmed incidents + synthetic generated cases.
3. **Base model:** binary classifier (normal vs anomalous action) over extracted features.
4. **Features:** payload embeddings, rolling velocity, scope drift score, recipient diversity.
5. **Validation:** hold-out of real public incidents as test set.
6. **Deploy:** ONNX model running locally in the SDK (no external calls in hot path).

### Why local ONNX, not external call

- Latency: <50ms vs 200ms+ with external call.
- Privacy: payload embeddings don't leave the dev's device.
- Cost: zero per inference.
- Availability: works offline.

## Expected false positives

The heuristic detector has a known trade-off: it prefers false positives (legitimate action blocked) over false negatives (harmful action allowed). This is compensated by:

- **Learning mode** calibrating thresholds to real behavior (significantly reduces FPs)
- **Feedback loop:** every false positive reported by the user refines the detector
- **Optional paranoid mode** for users who prefer more blocking

**MVP target:** < 5% false positive rate in the first week of enforcement, over 100+ users.

## References

- [Architecture — Layer 3](../architecture.md)
- [Learning Mode](../learning-mode.md) — how detector thresholds are generated
- ADR-0006: Heuristics first, ML later (pending)
- Behavioral tests: [`/packages/core/test/behavioral/anomaly-detection.test.ts`](../../packages/core/test/behavioral/anomaly-detection.test.ts) (pending)
