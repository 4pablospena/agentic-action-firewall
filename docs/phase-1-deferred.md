# Phase 1 — deferred slices (5–7)

The dashboard MVP (slices 0–4) ships first. Status below reflects implementation progress.

## Slice 5 — Control plane (Hono + Redis) — **implemented (dev)**

- [`apps/control-plane/`](../apps/control-plane/) — Hono API (`POST /kill`, `GET /kill/check`)
- Redis in [`docker-compose.yml`](../docker-compose.yml)
- Dashboard forwards kill events via [`sync-kill-switch.ts`](../apps/dashboard/server/utils/sync-kill-switch.ts)
- Core remote check: [`kill-switch-remote.ts`](../packages/core/src/layers/kill-switch-remote.ts)
- ADR: [`0009-redis-control-plane.md`](adrs/0009-redis-control-plane.md)

Cloudflare Workers deployment remains Phase 1+ ops work.

## Slice 6 — ML detector (ONNX) — **scaffold only**

- [`anomaly-ml.ts`](../packages/core/src/layers/anomaly-ml.ts) — stub with heuristic fallback
- ADR-0006 amended with `onnxruntime-node` target
- Full model training pipeline blocked on beta telemetry

## Slice 7 — Multi-channel + Phase 1b — **partial**

- Approval webhook dispatch: [`approval-notifications.ts`](../apps/dashboard/server/utils/approval-notifications.ts)
- Slack incoming webhook support via `NUXT_SLACK_WEBHOOK_URL`
- Resend/Twilio env stubs (integration Phase 1b)
- Team plan: approval pooling, multi-workspace SSO prep — **pending**

## Learning Mode — **implemented in core (Wave 1)**

- Observation recorder + baseline builder in [`packages/core/src/learning/`](../packages/core/src/learning/)
- CLI: `aaf learning status|export`
- Spec: [`learning-mode.md`](learning-mode.md)
- Dashboard review UI — **deferred (LM-4)**
