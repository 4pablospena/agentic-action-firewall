# Phase 1 — deferred slices (5–7)

The dashboard MVP (slices 0–4) ships first. The following remain **planned** per [`docs/overview.md`](overview.md) and [`docs/architecture.md`](architecture.md):

## Slice 5 — Control plane (Hono + Redis)

- Edge API for distributed kill switch (`POST /api/v1/kill` → Redis flag)
- Dashboard kill events sync to control plane
- **Requires ADR** for Redis in agent hot path (cloud opt-in)

## Slice 6 — ML detector (ONNX)

- Replace heuristic Layer 3 primary path with local ONNX model
- Opt-in telemetry → training pipeline
- **Requires ADR** per [`docs/adrs/0006-heuristics-first.md`](adrs/0006-heuristics-first.md)

## Slice 7 — Multi-channel + Phase 1b

- SMS (Twilio), email (Resend), approval webhooks
- Team plan: approval pooling, multi-workspace SSO prep

## Parallel track (recommended)

- **Learning Mode** ([`docs/learning-mode.md`](learning-mode.md)) — 72h observation + baseline YAML; critical for adoption, not blocked by dashboard UI.
