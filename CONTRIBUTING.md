# Contributing

Thanks for considering a contribution to Agent Action Firewall.

## Before you contribute

1. Read the [source-of-truth hierarchy](./docs/adrs/0001-source-of-truth.md).
2. Check existing issues to avoid duplicate work.
3. For significant changes, open a discussion or RFC first.

## Local development

Requirements: **Node.js 22+**, **pnpm 9+**.

```bash
git clone https://github.com/your-org/agentic-action-firewall.git
cd agentic-action-firewall
pnpm install
pnpm validate:schemas   # JSON Schema fixtures
pnpm generate:types     # schemas → packages/core/src/generated/
pnpm typecheck
pnpm build
pnpm test
pnpm test:behavioral   # 25 enforcement specs
pnpm exec aaf policy validate ./schemas/fixtures/firewall.example.yml
```

CI runs the same checks on every push and pull request (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).

## Pull requests

- Each PR should answer:
  - Which doc(s) have been updated?
  - Are related schemas affected?
  - Are there behavioral tests validating the change?
  - For structural decisions: does an ADR exist?

## Code of conduct

Be respectful. Disagree about ideas, never about people.

## License

By contributing, you agree your contributions will be licensed under MIT.
