# AAF Dashboard (`@agent-firewall/dashboard`)

Pro dashboard for audit log, approvals, policies, and kill switch management.

UI: [shadcn-vue](https://www.shadcn-vue.com/) with a Material-inspired shell (see [ADR-0008](../../docs/adrs/0008-dashboard-shadcn-ui.md)).

## Prerequisites

- Node.js 22 LTS
- pnpm (workspace root)
- Docker (PostgreSQL)

## Quick start

From the repository root:

```bash
docker compose up -d
cp apps/dashboard/.env.example apps/dashboard/.env
pnpm install
pnpm --filter @agent-firewall/dashboard dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

### Local auth (no GitHub OAuth)

Set in `apps/dashboard/.env`:

```env
NUXT_DEV_AUTH_BYPASS=true
```

Then use **Continue as Dev User** on the login page.

### GitHub OAuth

Set `NUXT_OAUTH_GITHUB_CLIENT_ID` and `NUXT_OAUTH_GITHUB_CLIENT_SECRET` in `.env`.

Create a GitHub OAuth app with callback URL:

```text
http://localhost:3000/auth/github
```

### Demo audit data

Populate the audit log, approvals, and chain verification with sample signed entries:

```bash
pnpm --filter @agent-firewall/dashboard db:seed
```

Re-seed (replaces existing demo entries):

```bash
pnpm --filter @agent-firewall/dashboard db:seed -- --force
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `dev` | Load env, migrate, start Nuxt dev server |
| `build` | Production build |
| `preview` | Preview production build |
| `db:migrate` | Apply SQL migrations |
| `db:seed` | Insert demo audit chain for `dev@localhost` |
| `test` | Vitest unit tests |
| `test:e2e` | Playwright e2e (requires Postgres + build) |
| `typecheck` | Nuxt typecheck |

## E2E tests

Playwright uses `pnpm preview` against a built app. From the repo root:

```bash
docker compose up -d
pnpm --filter @agent-firewall/dashboard build
pnpm --filter @agent-firewall/dashboard test:e2e
```

Ensure `apps/dashboard/.env` exists (or set `DATABASE_URL` and `NUXT_SESSION_PASSWORD`).

## Architecture notes

- **APIs:** Nitro routes under `server/api/v1/*` — unchanged by UI reskin
- **Auth:** `nuxt-auth-utils` + optional dev bypass (`server/routes/auth/dev.get.ts`)
- **Data:** PostgreSQL via Drizzle (`server/database/`)
- **Authenticated fetch:** use `useDashboardFetch()` in pages (forwards session cookies on SSR)
