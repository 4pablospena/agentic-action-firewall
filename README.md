# Agent Action Firewall

> Runtime protection layer for AI agent actions.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange.svg)]()

Agent Action Firewall (AAF) is a runtime interception layer that sits between any AI agent and the external systems the agent can manipulate: email, social networks, databases, third-party APIs, files, and payment services.

AAF inspects, classifies, and authorizes every action the agent takes before it executes, preventing cascading failures, infinite loops, automated spam, and unauthorized irreversible actions.

## The problem we solve

In February 2026, an OpenClaw agent deleted the entire Gmail inbox of a Meta AI researcher despite repeated stop commands. In November 2025, a four-agent LangChain pipeline entered an infinite loop and ran up a $47,000 bill in 11 days.

The current "AI guardrails" market filters text (LLM input/output) but doesn't intervene at the action layer. AAF fills that gap.

## Quick install

```bash
npm install @agent-firewall/core
```

```typescript
import { Firewall } from '@agent-firewall/core';
import { createSlackApprovalChannel, createWebApiSlackClient } from '@agent-firewall/slack-channel';
import { wrapLangChainTools } from '@agent-firewall/langchain';
// or: wrapClaudeTools from '@agent-firewall/claude-sdk'
// or: wrapOpenAITools from '@agent-firewall/openai'

const slack = createSlackApprovalChannel(
  {
    botToken: process.env.SLACK_BOT_TOKEN!,
    channelId: process.env.SLACK_APPROVAL_CHANNEL!,
    mfaApproverIds: ['U12345678'], // R4 "Approve (MFA verified)" allowlist
  },
  await createWebApiSlackClient(process.env.SLACK_BOT_TOKEN!),
);

const firewall = new Firewall({
  policies: './firewall.yml',
  onBlock: async (event) => notifyUser(event),
  onApprovalNeeded: (event) => slack.onApprovalNeeded(event),
});

const context = { agentId: 'my-agent', sessionId: 'sess-001' };
const protectedTools = wrapLangChainTools(firewall, [gmailTool, linkedinTool], context);
```

Wire Slack interactivity to `slack.handleInteraction(payload)` from your HTTP server (Hono, Express, etc.). Verify `X-Slack-Signature` in production before calling the handler.

## Documentation

- [Product overview](./docs/overview.md)
- [Technical architecture](./docs/architecture.md)
- [Learning Mode](./docs/learning-mode.md)
- [Policy reference](./docs/policies/reference.md)
- [EU AI Act compliance](./docs/compliance-eu-ai-act.md)

### Concepts

- [Risk tiers (R1–R4)](./docs/concepts/risk-tiers.md)
- [Anomaly detection](./docs/concepts/anomaly-detection.md)
- [Immutable audit log](./docs/concepts/audit-log.md)

### Architecture decisions

Significant decisions are documented as ADRs (Architecture Decision Records) in [`docs/adrs/`](./docs/adrs/).

## Project status

Pre-alpha. Phase 0 MVP and Phase 1 (dashboard, Learning Mode, control plane, ONNX ML detector, multi-channel notifications) are implemented. See [phase-1-deferred.md](./docs/phase-1-deferred.md) for slice status and Phase 1b backlog.

### Development

Requires Node.js 22+ and pnpm 9+.

```bash
pnpm install
pnpm validate:schemas
pnpm build
pnpm test
pnpm test:behavioral   # 32 enforcement specs
pnpm exec aaf policy validate ./schemas/fixtures/firewall.example.yml
```

### Dashboard (Phase 1)

```bash
docker compose up -d
cp apps/dashboard/.env.example apps/dashboard/.env   # set OAuth + session password
pnpm --filter @agent-firewall/dashboard dev          # auto-builds workspace deps on first run
```

Or from the repo root:

```bash
pnpm dev:dashboard
```

Open `http://localhost:3000/login`. Ingest audit entries via `POST /api/v1/audit/entries` (session cookie or future API key).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

Monorepo: `packages/*`, `apps/dashboard`, `schemas/`.

## License

MIT.
