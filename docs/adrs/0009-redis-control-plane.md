# ADR-0009: Redis control plane for distributed kill switch

## Status

Accepted

## Context

Phase 1 dashboard records kill switch activations in PostgreSQL ([`apps/dashboard/server/api/v1/kill/index.post.ts`](../../apps/dashboard/server/api/v1/kill/index.post.ts)). Agents running in the field use an in-memory [`KillSwitch`](../../packages/core/src/layers/kill-switch.ts) that does not receive remote activations.

[`docs/architecture.md`](../architecture.md) specifies a separate Hono control plane on Cloudflare Workers with Redis for sub-5ms distributed flags.

## Decision

1. **Redis is opt-in.** The core firewall works without Redis (local-first). Remote kill requires configuring `controlPlaneUrl` on the agent.
2. **Dashboard → control plane → Redis.** Dashboard POST persists to Postgres (audit trail) and forwards to the control plane API.
3. **Agents poll/check the control plane** before each evaluation (or cache with short TTL). No direct Postgres access from agents.
4. **Local dev:** Redis 7+ in `docker-compose.yml` and `apps/control-plane/` Hono service for development.
5. **Production Workers:** Cloudflare Workers entry (`src/worker.mjs`) uses **Upstash Redis REST**; Node dev uses **ioredis**. Shared `KillSwitchStore` interface in `kill-switch-store.mjs`.
6. **Auth:** Dashboard sends `Authorization: Bearer` on `POST /kill` when `NUXT_CONTROL_PLANE_TOKEN` is set.

## Consequences

- Adds optional infrastructure for Pro/Team distributed enforcement.
- Core remains usable offline without control plane.
- Requires Redis availability for distributed kill switch (documented as Pro feature).

## Alternatives considered

- **Postgres polling from agents:** Rejected — latency and coupling to dashboard DB.
- **Redis in core hot path by default:** Rejected — violates local-first principle.

## References

- [`docs/phase-1-deferred.md`](../phase-1-deferred.md) — Slice 5
- [`docs/architecture.md`](../architecture.md) — control plane section
