# ADR-0008: Dashboard UI — shadcn-vue + Material shell

## Status

Accepted · 2026-06-06

## Context

Phase 1 dashboard (`apps/dashboard/`) shipped with `@nuxt/ui` and a minimal dark header layout. We want a Pro-grade admin appearance aligned with [Material Dashboard Shadcn Vue](https://github.com/creativetimofficial/material-dashboard-shadcn-vue) (Creative Tim, MIT): sidebar navigation, card-based content, Material green primary, and light/dark mode.

The Creative Tim template is **Vite + Vue Router**, not Nuxt. We must port visual patterns only; Nitro APIs, `nuxt-auth-utils`, and Drizzle stay unchanged.

Prior docs ([`docs/architecture.md`](../architecture.md)) listed Nuxt UI for the dashboard.

## Decision

Replace `@nuxt/ui` in `apps/dashboard/` with **shadcn-nuxt** (shadcn-vue + Reka UI), **@nuxtjs/color-mode** for light/dark/system, and a **Material-inspired shell** (sidebar + header) adapted from Creative Tim tokens.

Core packages (`packages/core/`, wrappers) remain framework-agnostic and unchanged.

## Practical application

- Dashboard dependencies: `shadcn-nuxt`, `@nuxtjs/color-mode`, `lucide-vue-next`, `reka-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@tailwindcss/vite`
- Remove `@nuxt/ui` from `apps/dashboard/package.json`
- UI components live in `apps/dashboard/components/ui/`
- Layout shell in `apps/dashboard/components/layout/`
- CSS tokens in `apps/dashboard/assets/css/main.css` (Material light + dark variables)
- Pages use `useDashboardFetch()` for authenticated API calls (SSR cookie forwarding unchanged)

## Consequences

### Positive

- Consistent Material admin look with light/dark toggle
- shadcn-vue components are owned source (no black-box UI kit)
- MIT template reference; no license conflict

### Negative

- Divergence from original “Nuxt UI everywhere” note in architecture.md
- More UI code to maintain than `@nuxt/ui` primitives
- shadcn + Tailwind v4 setup is more manual than Nuxt UI

### Mitigations

- ADR documents the change; update `docs/architecture.md` and `.cursorrules`
- Port only needed components (button, card, table, sheet, etc.)
- Keep API/auth layers untouched; behavioral tests on server routes unchanged

## Alternatives considered

### A. Keep @nuxt/ui, copy colors only

Rejected: user chose full shadcn-nuxt migration for template fidelity.

### B. Replace Nuxt with Vite SPA from Creative Tim

Rejected: loses Nitro SSR, `nuxt-auth-utils`, and monorepo integration.

## References

- [Material Dashboard Shadcn Vue (Creative Tim)](https://github.com/creativetimofficial/material-dashboard-shadcn-vue) — MIT
- [shadcn-nuxt module](https://nuxt.com/modules/shadcn)
