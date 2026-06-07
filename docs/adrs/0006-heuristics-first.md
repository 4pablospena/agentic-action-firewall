# ADR-0006: Heuristics first, ML later (Layer 3)

## Status

Accepted · 2026-06-06

## Context

Layer 3 (Behavioral Anomaly Detector) is AAF's core differentiator. It must detect patterns like tool loops (LangChain $47K incident) and mass deletes (OpenClaw incident) within the hot-path latency budget (~80ms for Layer 3).

Options: rule-based heuristics, external ML API calls, or local ONNX models. Each trades accuracy, latency, privacy, and operational complexity differently.

## Decision

**MVP (Phase 0): heuristic detector only.**

Six patterns with configurable thresholds (defaults in specs, calibrated from Learning Mode baseline):

| Pattern               | Default signal                          |
| --------------------- | --------------------------------------- |
| repetition            | Cosine similarity > 0.92                |
| loop                  | Same sequence 3+ times in 60s           |
| speed                 | < 3s mean interval sustained > 1 min    |
| mass_action           | > 50 destructive ops in 60s             |
| recipient_escalation  | Recipients > baseline p95 × 10          |
| scope_drift           | Tool not in Learning Mode observed set  |

Output shape: [`schemas/anomaly-result.schema.json`](../../schemas/anomaly-result.schema.json).

**Phase 1: local ONNX model** replaces heuristics as primary detector, trained on opt-in beta telemetry. Heuristics remain as fallback if ONNX unavailable.

**Hot path constraints (MVP and Phase 1):**
- No external network calls during detection.
- Embeddings computed locally (Voyage-3-lite or text-embedding-3-small via local/batch path where configured).
- Prefer false positives over false negatives; Learning Mode calibrates thresholds.

## Practical application

- Detector result MUST validate against `anomaly-result.schema.json`.
- Behavioral tests name real incidents: OpenClaw (mass_action), LangChain (loop).
- ML pipeline (Phase 1): collection → labeling → ONNX export → local inference < 50ms.

## Consequences

### Positive

- Predictable, debuggable behavior for MVP launch.
- Zero inference cost at scale.
- Works offline — aligns with local-first principle.
- Privacy: payload embeddings need not leave the device.

### Negative

- Heuristics miss novel attack patterns ML might catch.
- Threshold tuning requires Learning Mode to avoid false positives.

### Mitigations

- Learning Mode baseline calibrates thresholds per agent.
- User false-positive feedback loop (weight 3.0) in continuous learning.
- Phase 1 ONNX upgrade path documented in [`anomaly-detection.md`](../concepts/anomaly-detection.md).

## Amendment (2026-06): ONNX runtime choice

When Slice 6 ships, Layer 3 will use **`onnxruntime-node`** for local inference with heuristic fallback when no model is loaded (`packages/core/src/layers/anomaly-ml.ts`). Target: <50ms p95 inference, zero network calls, opt-in via `onnxModelPath` in firewall config.

Training pipeline (`packages/ml/`): synthetic bootstrap dataset → scikit-learn → ONNX export via skl2onnx. CLI: `aaf ml train --synthetic`. Beta telemetry (`aaf telemetry export`) replaces synthetic labels when available.

## Alternatives considered

### A. External ML API from day 1

Rejected. Adds 200ms+ latency, cost per inference, privacy concerns, and offline failure modes.

### B. ML only, no heuristics

Rejected for MVP. Requires training data we don't have pre-launch. Heuristics ship immediately and reproduce documented incidents.

### C. Hybrid heuristics + external LLM for anomaly

Rejected. LLM latency and cost incompatible with hot path. LLM reserved for Layer 1 fallback classification only.

## References

- [Anomaly detection](../concepts/anomaly-detection.md)
- [Learning Mode](../learning-mode.md)
- [Schema: anomaly-result.schema.json](../../schemas/anomaly-result.schema.json)
