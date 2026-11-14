> Read this file when: you name a file, class, route or translation key, or look for the doc covering an area.

# Conventions

## Topic docs are the detailed conventions

Each topic doc carries a `paths:` frontmatter and is linked from `.claude/rules/`, so Claude Code loads it when a matching file is touched. Read the matching one before editing in its area:

- `docs/routes.md`: route modules, loaders/actions, intent pattern, Conform + Zod forms.
- `docs/services.md`: service classes, permission checks, error types.
- `docs/authorization.md` / `docs/authentication.md`: middleware chain, roles and permission matrix, better-auth setup, API keys.
- `docs/database.md`: Prisma schema and query conventions, migrations.
- `docs/testing.md`: Vitest server vs browser projects, factories, page objects for e2e.
- `docs/components.md`: design-system and component patterns.
- `docs/i18n.md`: translation keys (`en` and `fr`, both files, sorted).
- `docs/jobs.md`, `docs/emails.md`, `docs/storage.md`, `docs/redis.md`, `docs/flags.md`, `docs/logging.md`, `docs/tracing.md`, `docs/api.md`.

## Domain names come from the glossary

Name classes, functions, tests and issues with the terms of `docs/GLOSSARY.md`, as written there. A Talk and a Proposal are different things; so are a Format and a Category.

## Files

- Files are kebab-case. A service file is named after its class: `EventCreation` → `event-creation.server.ts`.
- `.server.ts` marks code that must never reach the client bundle (services, Prisma, secrets).
- Zod schemas for a service live next to it in `*.schema.server.ts`.
- Tests sit next to the code: `*.test.ts` for Node, `*.test.tsx` for the browser.

## Imports

Imports keep the `.ts`/`.tsx` extension. Use the `~/` alias for `app/` and `tests/` for test helpers (both declared in `tsconfig.json`).

## Formatting and lint

oxfmt, `prisma format` and oxlint own the style; `pnpm check` runs them plus `tsc`, `knip` and `pnpm i18n:check`, as in CI.
