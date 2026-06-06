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

const firewall = new Firewall({
  policies: './firewall.yml', // validated at load time (cwd-relative path)
  onBlock: async (event) => notifyUser(event),
  onApprovalNeeded: async (event) => notifyApprover(event),
});

const protectedTools = firewall.wrap([
  gmailTool,
  linkedinTool,
  databaseTool,
]);

const agent = new ClaudeAgent({ tools: protectedTools });
await agent.run('Send follow-up emails to my prospects');
```

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

Pre-alpha. Core firewall engine and CLI policy validation are implemented. See [roadmap](./docs/overview.md#roadmap).

Monorepo: `packages/core` (5-layer pipeline), `packages/cli` (`aaf policy validate`), schema validation, and CI.

### Development

Requires Node.js 22+ and pnpm 9+.

```bash
pnpm install
pnpm validate:schemas
pnpm build
pnpm test
pnpm test:behavioral   # 25 enforcement specs
pnpm exec aaf policy validate ./schemas/fixtures/firewall.example.yml
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

Phase 1 adds the Pro/Team dashboard (`apps/dashboard/`, Nuxt 3), the Nuxt integration module (`@agent-firewall/nuxt`), and a distributed control plane (Hono on Cloudflare Workers).

## License

MIT.
