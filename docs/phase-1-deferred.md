# Phase 1 — deferred slices (5–7)

The dashboard MVP (slices 0–4) ships first. Status below reflects implementation progress.

## Slice 5 — Control plane (Hono + Redis) — **implemented**

- [`apps/control-plane/`](../apps/control-plane/) — Hono API + Workers entry + Upstash adapter
- Redis in [`docker-compose.yml`](../docker-compose.yml)
- Dashboard forwards kill events via [`sync-kill-switch.ts`](../apps/dashboard/server/utils/sync-kill-switch.ts)
- Core remote check: [`kill-switch-remote.ts`](../packages/core/src/layers/kill-switch-remote.ts)
- CI: `control-plane-integration` job with Redis service
- ADR: [`0009-redis-control-plane.md`](adrs/0009-redis-control-plane.md)

Cloudflare Workers deployment wiring (`wrangler.toml`) is in-repo; production secrets remain ops work.

## Slice 6 — ML detector (ONNX) — **implemented (synthetic bootstrap)**

- Feature extractor: [`anomaly-features.ts`](../packages/core/src/layers/anomaly-features.ts)
- Runtime: [`anomaly-ml.ts`](../packages/core/src/layers/anomaly-ml.ts) with `onnxruntime-node`
- Training pipeline: [`packages/ml/`](../packages/ml/) (synthetic CSV → LogisticRegression → ONNX)
- CLI: `aaf ml train --synthetic`, `aaf ml validate --model …`, `aaf telemetry export` (stub)
- Bundled test model: `packages/ml/fixtures/anomaly-v1.onnx`

Real beta telemetry replaces synthetic labels when available.

## Slice 7 — Multi-channel + Phase 1b — **implemented (MVP)**

- Approval webhook + Resend/Twilio in [`approval-notifications.ts`](../apps/dashboard/server/utils/approval-notifications.ts)
- Pending ingest alerts via [`pending-approval-notifications.ts`](../apps/dashboard/server/utils/pending-approval-notifications.ts) + `@agent-firewall/slack-channel` blocks
- Team plan: approval pooling, multi-workspace SSO prep — **pending**

## Learning Mode — **implemented**

- Observation SQLite store + baseline builder in [`packages/core/src/learning/`](../packages/core/src/learning/)
- CLI: `aaf learning status|export`
- Dashboard review UI: [`pages/learning/`](../apps/dashboard/pages/learning/) (template narrative, 3 sections)
- Spec: [`learning-mode.md`](learning-mode.md)
