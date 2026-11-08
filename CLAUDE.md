# CLAUDE.md

Conference Hall is a SaaS for managing CFPs: speakers write talks once and submit them to events, organizers review, deliberate, publish results and build schedules. Domain terms are defined in `docs/GLOSSARY.md`; use them as written there when naming things in code, tests and issues.

## Commands

Docker (`docker compose up`) must be running for tests, e2e and the dev server (Postgres, Redis, S3 via Garage, Mailpit).

- `pnpm dev`: web server (Fastify + React Router, port 3000) and the BullMQ jobs worker together.
- `pnpm test`: pushes the Prisma schema to the test DB, then runs all Vitest projects.
- `pnpm test:unit run <file>`: one test file, without the schema push (run `pnpm test:db` first if the schema changed).
- `pnpm test:e2e <file>`: one Playwright spec.
- `pnpm tsc`: runs `react-router typegen` then `tsc -b`. Run it after adding or changing routes so `./+types/*` exist.
- `pnpm exec prisma generate` after any `prisma/schema.prisma` change; new migrations via `pnpm db:migrate:dev --name="..."`.
- `pnpm db:reset` reseeds the local dev DB (test users `superman@example.com` / `batman@example.com`, password `password`). It is destructive, so ask before running it.

## Architecture

- `servers/web.ts` is a Fastify server mounting React Router (SSR) with security, rate-limit and SEO plugins from `servers/fastify/`. `servers/jobs.ts` is a separate BullMQ worker process. Both load OpenTelemetry via `--import`.
- Routes are declared programmatically in `app/routes.ts` and point to route modules inside feature folders.
- `app/features/<area>/` holds vertical slices (`event-management`, `event-participation`, `speaker`, `team-management`, `admin`, ...). Inside, route modules sit at the top level with `components/`, `services/`, `models/` siblings.
- `services/*.server.ts` hold all business logic and DB access: one class per file built via `Class.for(authorizedContext)` or `Class.of(id)`, using the `db` singleton from `prisma/db.server.ts` directly (no repositories). Zod schemas live next to them in `*.schema.server.ts`.
- Authorization is a middleware chain on route modules (`requireAuth → requireAuthorizedTeam → requireAuthorizedEvent`) that puts typed contexts on `context`; loaders and actions read them and pass them to services, which check `permissions.canXxx`.
- `app/shared/` is cross-feature infrastructure (auth, authorization, jobs, emails, i18n, cache, storage, feature flags, logger). `app/design-system/` is the UI kit (Tailwind + CVA `cx()` + HeadlessUI). `app/app-platform/` is app shell, SEO, legal pages.
- Path aliases: `~/*` → `app/*`, `tests/*` → `tests/*`. Imports keep the `.ts`/`.tsx` extension.

## Topic docs

Each file in `docs/` with a `paths:` frontmatter is the convention reference for those paths. Read the matching one before editing in its area:

- `docs/routes.md`: route modules, loaders/actions, intent pattern, Conform + Zod forms.
- `docs/services.md`: service classes, permission checks, error types.
- `docs/authorization.md` / `docs/authentication.md`: middleware chain, roles and permission matrix, better-auth setup, API keys.
- `docs/database.md`: Prisma schema and query conventions, migrations.
- `docs/testing.md`: Vitest server vs browser projects, factories, page objects for e2e.
- `docs/components.md`: design-system and component patterns.
- `docs/i18n.md`: translation keys (`en` and `fr`, both files, sorted).
- `docs/jobs.md`, `docs/emails.md`, `docs/storage.md`, `docs/redis.md`, `docs/flags.md`, `docs/logging.md`, `docs/tracing.md`, `docs/api.md`.

## Testing gotchas

- Vitest has two projects: `*.test.ts` (and `*.email.test.tsx`) run in Node against the real test DB, serially, with the DB truncated after each test; `*.test.tsx` run in headless Chromium.
- Create test data with `tests/factories/` (traits + attributes), not raw Prisma calls. Vitest globals are available without imports.
- Test DB env comes from `tests/.env.test`.
