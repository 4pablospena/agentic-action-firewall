# Product overview

> **Source of truth for:** value proposition, business model, roadmap.
> **NOT the source of truth for:** technical implementation details (see [`architecture.md`](./architecture.md)).

## Executive summary

Agent Action Firewall (AAF) is a runtime interception layer that sits between any AI agent and the external systems the agent can manipulate. AAF inspects, classifies, and authorizes every action the agent takes before it executes.

It integrates into any agent framework (LangChain, CrewAI, Claude Agent SDK, OpenAI Agents, custom code) in fewer than 5 lines of code. It applies 5 protection layers, maintains an immutable log of every decision, and satisfies EU AI Act audit requirements without the developer having to build that infrastructure.

## The problem

The current "AI guardrails" market has grown significantly in 2025–2026 but is mispositioned. Most products solve filtering of text going in and out of the model (Galileo, NeMo Guardrails, Llama Guard, Lakera Guard). That works for chatbots, not for agents that execute actions.

### Documented incidents that validate the problem

#### OpenClaw incident — February 2026

- **Original task:** organize Gmail inbox.
- **Behavior:** mass-deletion loop described as a "speed run".
- **Attempted mitigation:** multiple stop commands from mobile, all ignored.
- **Resolution:** manual process termination on the physical machine.
- **Lesson:** no circuit breaker existed at the action layer.

#### LangChain multi-agent incident — November 2025

- **Setup:** 4 agents coordinated via A2A protocol.
- **Behavior:** ping-pong loop between Analyzer and Verifier.
- **Duration:** 11 days undetected.
- **Cost:** $47,000 in API tokens.
- **Lesson:** no pre-execution budget enforcement per agent.

#### ServiceNow Now Assist vulnerability — late 2025

- **Vector:** second-order prompt injection via low-privilege agent.
- **Impact:** export of full case files to an external URL.
- **Lesson:** trust between agents without verification is a critical exfiltration vector.

### Current market analysis

| Product                   | What it protects                    | What it does NOT protect                  |
| ------------------------- | ----------------------------------- | ----------------------------------------- |
| Galileo · Lakera          | Text inputs and outputs             | Agent's external actions                  |
| NeMo Guardrails           | Conversational dialogs              | Multi-turn behavioral patterns            |
| Llama Guard · OpenAI Mod. | Toxic / sensitive content           | Tool loops                                |
| AWS Bedrock Guardrails    | Provider-specific model             | Multi-framework / multi-provider          |
| Snyk AI                   | Pointwise tool call inspection      | Aggregate behavioral anomalies            |
| **Agent Action Firewall** | **External actions + anomalies**    | —                                         |

## Market size and timing

- **EU AI Act** enters into force in August 2026, requiring logging and audit of autonomous agents in regulated applications.
- **More than 50 public AI incidents** documented in H1 2026 (vs. a sparse count in H2 2025).
- **OWASP AI Agent Security Top 10 for 2026** highlights "Excessive Agency" and "Improper Access Control" as top-tier risks.
- **Gartner predicts** that more than 40% of agentic AI projects will be cancelled by end of 2027 due to unresolved engineering issues.
- **Only 14%** of enterprises with agent pilots have scaled to full operational use.

## Product dimensions

| Dimension                | Detail                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| Category                 | Runtime security · DevSecOps · Compliance                           |
| Core technology          | TypeScript proxy · YAML policies · Redis · ML classification        |
| Distribution model       | Open source (MIT) + paid tiers                                      |
| Time to MVP              | 8 weeks (1 full-time developer)                                     |
| Initial target           | Developers and teams with agents in production                      |
| Differentiator           | Only firewall specific to the action layer, not the text layer      |
| Business model           | Open core · Pro $19/mo · Team $49/dev/mo · Enterprise               |

## Business model

### Plan structure

| Plan          | Price                | Limits                                             | Target                              |
| ------------- | -------------------- | -------------------------------------------------- | ----------------------------------- |
| Open Source   | $0                   | Full core · self-hosted · unlimited                | Individual devs · viral loop        |
| Pro           | $19/mo               | Dashboard · 90-day audit · multi-channel notif     | Serious devs and freelancers        |
| Team          | $49/dev/mo           | Workspaces · SSO · compliance reports              | Teams of 5–50 devs                  |
| Enterprise    | From $2,000/mo       | On-premise · SLA · SCIM · notarization             | Regulated companies · > 50 devs     |

### Estimated unit economics

| Metric                        | Month 6      | Month 12        | Month 24         |
| ----------------------------- | ------------ | --------------- | ---------------- |
| Package installs              | 5,000        | 25,000          | 120,000          |
| Monthly active users          | 1,200        | 6,000           | 30,000           |
| Pro conversion (4%)           | 48 ($912)    | 240 ($4,560)    | 1,200 ($22,800)  |
| Teams on Team plan            | 2 ($490)     | 15 ($3,675)     | 80 ($19,600)     |
| Enterprise contracts          | 0            | 1 ($3,000)      | 5 ($15,000)      |
| **Estimated total MRR**       | **~$1,400**  | **~$11,200**    | **~$57,400**     |

## Go-to-market strategy

### Phase 0 — Credibility (months 1–3)

- Launch on Show HN, Product Hunt, /r/LocalLLaMA.
- In-depth technical post explaining the OpenClaw incident and how AAF would have prevented it.
- Conference talks: AI Engineer Summit, KubeCon, LangChain meetups.
- Published external security audit.

### Phase 1 — Conversion (months 4–9)

- Free → Pro: dashboard as gating feature, presented at moments of maximum value.
- Product-led growth: every prevented incident triggers a notification with a dashboard link.
- Integrations with Datadog and Sentry to enter the developer's workflow.
- Content marketing: post-mortem analysis of public agent incidents.

### Phase 2 — Enterprise (months 10+)

- Sales-led in regulated companies: finance, healthcare, legal in EU/UK.
- Positioning as an EU AI Act compliance tool.
- Partnerships with AI auditors and consultancies.
- SOC 2 Type II certification.

## Roadmap

| Phase                   | Period      | Main milestone                                   | Success metric                          |
| ----------------------- | ----------- | ------------------------------------------------ | --------------------------------------- |
| Phase 0 — MVP           | Wk 1–8      | Open source launch · 3 wrappers · Slack          | 200+ GH stars · 10 integrations         |
| Phase 0b — Adoption     | Wk 8–14     | DevRel · talks · content · external audit        | 5,000 npm installs                      |
| Phase 1 — Platform      | Wk 15–22    | Dashboard · ML detector · multi-channel          | 50 Pro users · $1,400/mo MRR            |
| Phase 1b — Conversion   | Wk 22–28    | Team plan · approval pooling · webhooks          | 10 teams on Team plan                   |
| Phase 2 — Compliance    | Wk 28–40    | EU AI Act tooling · SSO · audit reports          | 3 enterprise contracts signed           |
| Phase 2b — Enterprise   | Wk 40–52    | On-premise · SCIM · on-chain notarization        | ARR > $150,000                          |

## Main risks

See [docs/risks.md](./risks.md) for the full analysis. Summary:

- **Latency degrades agent experience** (Medium · High) → 200ms budget, continuous benchmarks
- **False positives block legitimate actions** (Medium · High) → conservative heuristics, learning mode
- **Cloud providers ship equivalent** (High · Medium) → time-to-market advantage, multi-framework
- **Slow open source adoption** (Medium · High) → investment in docs, reproducible examples
- **EU AI Act delayed or diluted** (Low · Medium) → product has value without regulation
