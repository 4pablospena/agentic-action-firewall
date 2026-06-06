# Technical architecture

> **Source of truth for:** layer structure, design principles, technology stack.
> **NOT the source of truth for:** data contracts (see [`/schemas`](../schemas/)), exact behavior (see tests).

## Design principle

AAF operates as a tool proxy between the agent and the external world. Any tool call — sending an email, posting on LinkedIn, writing to a database, calling an API — passes first through the five firewall layers. If all layers authorize, the action executes. If any layer blocks, the action is aborted and the user is notified.

### Design philosophy

- **Local-first:** the core works without external services. The control plane is optional and opt-in.
- **Framework-agnostic:** integrations for LangChain, CrewAI, Claude SDK, OpenAI Agents, and any custom wrapper.
- **Open core:** the firewall itself is open source MIT. Managed services generate revenue.
- **Default safe:** default policies are conservative. The developer relaxes them, never the other way around.
- **Auditable:** every firewall decision is recorded immutably with a cryptographic signature.

## The five protection layers

The five layers apply sequentially. The target total latency is **under 200ms at p95** to avoid degrading the agent experience.

```
┌─────────────────────────────────────────────────────────────┐
│                          AI AGENT                            │
│         (LangChain · CrewAI · Claude SDK · custom)           │
└──────────────────────────────┬───────────────────────────────┘
                               │ tool_call()
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — Intent Classifier                         ~30ms  │
│  Reversible · External · Irreversible · Sensitive (PII)     │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 — Rate Limiter & Budget Tracker             ~5ms   │
│  Per action · per recipient · per session · per cost        │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3 — Behavioral Anomaly Detector               ~80ms  │
│  Repetition · velocity · escalation · scope drift           │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4 — Approval Gate                             variable│
│  Tier-based · async via Slack/SMS/push · timeouts           │
├─────────────────────────────────────────────────────────────┤
│  LAYER 5 — Kill Switch & Audit Log                   ~10ms  │
│  Global stop · signed log · export GDPR/EU AI Act           │
└──────────────────────────────┬───────────────────────────────┘
                               │ allow / block
                               ▼
┌─────────────────────────────────────────────────────────────┐
│      EXTERNAL SYSTEMS (Gmail · LinkedIn · DB · APIs)         │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1 — Intent classification

Every tool call is automatically classified into one of four risk categories. See [`concepts/risk-tiers.md`](./concepts/risk-tiers.md) for the canonical definition.

| Tier | Level    | Description                                                          |
| ---- | -------- | -------------------------------------------------------------------- |
| R1   | Low      | Reversible — read email, query DB, list files                        |
| R2   | Medium   | External — send a message, post on social, call a webhook            |
| R3   | High     | Irreversible — delete data, modify config, execute code              |
| R4   | Critical | Sensitive — touches PII, credentials, financial transactions         |

Classification combines static rules (based on tool name and parameters) with a lightweight LLM for ambiguous cases.

### Layer 2 — Rate Limiter & Budget Tracker

Enforces frequency limits segmented by dimension. Unlike traditional rate limiters that cap globally, AAF limits by the combination of:

- **Tool type:** e.g., max 20 emails sent/hour per agent.
- **Recipient:** e.g., max 3 messages to the same email in 24h.
- **Session:** e.g., max 100 external actions per conversation.
- **Cost:** e.g., max $5 of tokens per session.
- **Velocity:** e.g., max 1 external action every 6 seconds (human baseline).

**Backends:** in-memory (single instance), Redis 7+ (distributed).

### Layer 3 — Behavioral Anomaly Detector

The core layer of the product. Detects anomalous behavioral patterns before they become real damage. See [`concepts/anomaly-detection.md`](./concepts/anomaly-detection.md).

| Pattern                       | Detection                                                                              | Default action                     |
| ----------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| Repeated message              | Cosine similarity > 0.92 over embeddings of last N actions                             | Block if > 5 recipients            |
| Tool loop                     | Same tool-call sequence observed 3+ times in 60s                                       | Exponential throttle               |
| Recipient escalation          | Recipient list grows > 10x relative to session baseline                                | Block + notify                     |
| Scope drift                   | Agent calls tools outside the initially declared scope                                 | Block + require approval           |
| Superhuman velocity           | More than 1 external action every 3 seconds sustained for > 1 min                      | Throttle to human velocity         |
| Mass actions                  | Delete/modify operations on > 50 items in < 60s                                        | Pause + snapshot + approval        |

### Layer 4 — Approval Gate

Implements selective human-in-the-loop. The most common critique of approval systems is that they generate alert fatigue. AAF solves this with tier-based approval.

| Tier              | Default behavior                                      | Configurable                            |
| ----------------- | ----------------------------------------------------- | --------------------------------------- |
| R1 · Reversible   | Auto-approve, log only                                | Paranoid mode: log + notify             |
| R2 · External     | Notify the user, 30s cancellation window              | 0–120s configurable                     |
| R3 · Irreversible | Block until explicit approval                         | Pre-authorized approval by pattern      |
| R4 · Critical     | Always block, approval requires MFA                   | Not relaxable without admin override    |

**Notification channels:** Slack (MVP), SMS via Twilio, iOS/Android push, email fallback, webhook.

### Layer 5 — Kill Switch & Audit Log

Two critical guarantees:

1. **Kill switch:** instantly stops all actions of all associated agents. Implemented as a distributed flag (Redis SET with TTL) queried in under 5ms.

2. **Immutable audit log:** every decision is recorded with an Ed25519 signature, chained with the hash of the previous record. See [`concepts/audit-log.md`](./concepts/audit-log.md).

```bash
# CLI
$ aaf kill --reason "agent runaway in LinkedIn outreach"
✓ Kill switch activated globally at 14:23:11 UTC
✓ 3 active agents stopped
✓ 47 pending actions cancelled

# HTTP API
POST /api/v1/kill
{
  "scope": "all" | "agent:<id>" | "session:<id>",
  "reason": "runaway behavior detected"
}
```

## Technology stack

| Layer                       | Technology                                       | Justification                                  |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Core runtime                | TypeScript + Node.js 22 LTS                      | Universal, broad ecosystem                     |
| Alternative runtime         | Python 3.12 (API parity)                         | LangChain and CrewAI are Python-first          |
| Local storage               | SQLite via better-sqlite3                        | Zero infra, fast lookup, embedded              |
| Distributed storage         | Redis 7+ (with RedisJSON module)                 | Pub/sub for kill switch, atomic ops            |
| LLM classifier              | Claude Haiku 4.5 (default) · GPT-5 nano          | Minimal cost, latency <100ms                   |
| Embeddings                  | Voyage-3-lite · text-embedding-3-small           | Similarity detection, low cost                 |
| Cryptographic signature     | Ed25519 via @noble/ed25519                       | Standard, lightweight, no native deps          |
| Audit storage               | S3-compatible (Cloudflare R2, AWS S3, MinIO)     | Append-only, write-once, predictable cost      |
| Dashboard (Pro/Team)        | Nuxt 3 · Vue 3 · Nuxt UI · Nitro                 | UI, workspace APIs, SSR — `apps/dashboard/`      |
| Nuxt integration module     | `@agent-firewall/nuxt`                           | Drop-in module for third-party Nuxt apps         |
| Control plane (distributed) | Hono on Cloudflare Workers                       | Kill switch, agent coordination — edge API     |
| Web database                | PostgreSQL 16 + Drizzle ORM                      | Workspaces, users, subscriptions               |
| Auth (Pro / dashboard)      | nuxt-auth-utils · Sidebase nuxt-auth             | Sessions and OAuth for dashboard users         |
| Auth (Team / Enterprise)    | WorkOS (SSO, MFA, SCIM)                          | B2B identity — Phase 2                         |
| Notifications               | Slack SDK · Twilio · APNs · FCM · Resend         | Full channel coverage                          |
| Tests                       | Vitest + Playwright for wrappers                 | TypeScript ecosystem standard                  |
| CI/CD                       | GitHub Actions + Changesets                      | Automated open source releases                 |
| Own observability           | OpenTelemetry → Honeycomb                        | Self-observable, no lock-in                    |

The dashboard and the distributed control plane are separate services. **Nitro**
(in `apps/dashboard/`) serves the Pro/Team UI and workspace APIs (policies,
incidents, audit viewer). **Hono** on Cloudflare Workers serves the low-latency
edge API used by agents in the field — kill switch, session flags, and
coordination — independent of the dashboard deployment cycle.

## Minimal integration API

```typescript
import { Firewall } from '@agent-firewall/core';
import { ClaudeAgent } from '@anthropic-ai/agent-sdk';

// 1. Configure the firewall with policies
const firewall = new Firewall({
  policies: './firewall.yml',
  onBlock: async (event) => {
    await notifyUser(event);
  },
  onApprovalNeeded: async (event) => {
    return await slackApprovalFlow(event);
  },
});

// 2. Wrap the agent's tools
const protectedTools = firewall.wrap([
  gmailTool,
  linkedinTool,
  databaseTool,
]);

// 3. Use normally — the agent doesn't know the firewall exists
const agent = new ClaudeAgent({ tools: protectedTools });
await agent.run('Send a follow-up email to my prospects');
```

## Official wrappers

MVP wrappers are TypeScript-only ([ADR-0002](./adrs/0002-typescript-first.md)). Each package exposes a thin adapter that maps framework tools to `ToolCall` and delegates to `@agent-firewall/core`.

| Framework                   | Package                          | Path                         | MVP status   |
| --------------------------- | -------------------------------- | ---------------------------- | ------------ |
| LangChain (JS)              | `@agent-firewall/langchain`      | `packages/langchain/`        | Implemented  |
| Anthropic Claude SDK        | `@agent-firewall/claude-sdk`     | `packages/claude-sdk/`       | Implemented  |
| OpenAI Agents SDK           | `@agent-firewall/openai`         | `packages/openai/`           | Implemented  |
| LangChain (Python)          | `@agent-firewall/langchain`      | —                            | Phase 1      |
| Nuxt 3                      | `@agent-firewall/nuxt`           | —                            | Phase 1      |
| CrewAI                      | `@agent-firewall/crewai`         | —                            | Phase 1      |
| Microsoft AutoGen           | `@agent-firewall/autogen`        | —                            | Phase 1      |
| Hermes Framework            | `@agent-firewall/hermes`         | —                            | Phase 1      |
| Custom (function-style)     | `@agent-firewall/core`           | `packages/core/`             | Implemented  |

```typescript
import { wrapLangChainTools } from '@agent-firewall/langchain';

const protectedTools = wrapLangChainTools(firewall, tools, {
  agentId: 'my-agent',
  sessionId: 'sess-001',
});
```

## Architecture decisions

Significant architectural changes are documented as ADRs in [`adrs/`](./adrs/):

- [ADR-0001: Source of truth for the product](./adrs/0001-source-of-truth.md)
- [ADR-0002: TypeScript as primary language](./adrs/0002-typescript-first.md)
- [ADR-0003: YAML for policies](./adrs/0003-yaml-for-policies.md)
- [ADR-0004: 72h observation window in Learning Mode](./adrs/0004-observation-window.md)
- [ADR-0005: 4-tier risk structure (R1–R4)](./adrs/0005-four-tier-risk.md)
- [ADR-0006: Heuristics first, ML later](./adrs/0006-heuristics-first.md)
- [ADR-0007: Ed25519 over RSA for audit log signing](./adrs/0007-ed25519-signing.md)
