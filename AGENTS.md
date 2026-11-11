# AGENTS.md

Conference Hall is a SaaS for managing CFPs: speakers write talks once and submit them to events, organizers review, deliberate, publish results and build schedules.
Name domain concepts exactly as `docs/GLOSSARY.md` defines them, in code, tests and issues.

## Commands

Start Docker (`docker compose up`) before `pnpm test`, `pnpm test:e2e` or `pnpm dev`: they need Postgres, Redis, S3 via Garage and Mailpit.

- `pnpm dev`: web server (Fastify + React Router, port 3000) and the BullMQ jobs worker together.
- `pnpm test`: push the Prisma schema to the test DB, then run all Vitest projects.
- `pnpm test:unit run <file>`: one Vitest file, without the schema push. Run `pnpm test:db` first if the schema changed.
- `pnpm test:e2e <file>`: one Playwright spec.
- `pnpm tsc`: `react-router typegen` then `tsc -b`. Run it after adding or changing routes so `./+types/*` exist.
- `pnpm check`: the CI static job (format, lint, tsc, knip, i18n).
- `pnpm exec prisma generate`: regenerate the Prisma client. Runs automatically via hook after editing `prisma/schema.prisma`.
- `pnpm db:migrate:dev --name="..."`: new migration.
- `pnpm db:reset`: reseed the local dev DB (test users `superman@example.com` / `batman@example.com`, password `password`).

## Architecture

- `servers/web.ts`: Fastify server mounting React Router (SSR) with security, rate-limit and SEO plugins from `servers/fastify/`. `servers/jobs.ts`: separate BullMQ worker process. Both load OpenTelemetry via `--import`.
- `app/routes.ts`: all routes, declared programmatically, pointing to route modules inside feature folders.
- `app/features/<area>/`: vertical slices (`event-management`, `event-participation`, `speaker`, `team-management`, `admin`, ...). Route modules at the top level, `components/`, `services/`, `models/` siblings.
- `services/*.server.ts`: all business logic and DB access, using the `db` singleton from `prisma/db.server.ts` directly. Zod schemas live next to them in `*.schema.server.ts`.
- Authorization: middleware chain on route modules (`requireAuth → requireAuthorizedTeam → requireAuthorizedEvent`) puts typed contexts on `context`; loaders and actions pass them to services, which check `permissions.canXxx`.
- `app/shared/`: cross-feature infrastructure (auth, authorization, jobs, emails, i18n, cache, storage, feature flags, logger, otel). `app/design-system/`: UI kit (Tailwind + CVA `cx()` + HeadlessUI). `app/app-platform/`: app shell, SEO, legal pages.
- Details and boundaries: [docs/architecture.md](docs/architecture.md).

## Conventions

- Write everything committed to the repo in English (code, comments, tests, docs, commit messages, PR descriptions): it is the project language. Only `app/locales/fr.*.json` holds French.
- Keep the `.ts`/`.tsx` extension in imports.
- Keep DB access in `services/*.server.ts`, out of route modules and components.
- Build services with `Class.for(authorizedContext)`, `Class.of(id)` or `Class.with(...)`, one class per file: see `docs/services.md`.
- Change translation keys only through the x18n CLI (`pnpm exec x18n set|rename|delete`), never by editing `app/locales/*.json` by hand: it keeps keys sorted and placeholders intact. Every key needs an `en` and a `fr` value, or `pnpm i18n:check` fails.
- Create test data with `tests/factories/` (traits + attributes), never raw Prisma calls: factories fill valid defaults and relations, so a schema change is fixed in one place and tests show only the attributes that matter.
- Expect two Vitest projects: `*.test.ts` (and `*.email.test.tsx`) run in Node against the real test DB, serially, truncated after each test; `*.test.tsx` run in headless Chromium.
- Read the topic docs: they load automatically from `.claude/rules/` when you touch matching files. Index: [docs/conventions.md](docs/conventions.md).

## Git workflow

- Branch features and fixes from `main`; branch hotfixes from `production`, then apply them to `main`.
- Write commit subjects as `<type>: <summary>` with type in `feat`, `fix`, `refactor`, `chore`, `doc`, `perf`.
- Make several small commits per PR: PRs are squashed on merge.
- Never commit `CLAUDE.local.md` or `.claude/settings.local.json`: they hold personal overrides.

## Verification

- Run `pnpm test:unit run <file>` on every Vitest file you create or change, `pnpm test:e2e <file>` on every Playwright spec.
- Run `pnpm check` before handing work off: it mirrors the CI `static-tests` job.
- Formatting (oxfmt) and `oxlint --fix` run via hook after each edit; the Stop hook reformats and lint-fixes the whole tree at the end of each turn, then fails on remaining `pnpm lint` errors.
- Run `rm -rf node_modules/.vite` when browser tests fail outside the diff with `Invalid hook call` or `useState` on null: the Vite deps cache is stale.

## Agent workflow

- Use the `db-migration` skill for any schema change and `add-route` for a new page or action.
- Use the `x18n` skill for translation keys: it links to `node_modules/@x18n/cli/skills/x18n`, so it follows the installed version.
- Ask the `e2e-writer` subagent to write or fix Playwright specs and page objects.
- Update `AGENTS.md` and the matching `docs/*.md` in the same commit as any command, stack or convention change.
- Create git worktrees outside the repo: tools in the main checkout would scan them.

## Forbidden

- Never run `pnpm db:reset` without asking: it wipes the local dev DB.
- Never add a repository layer over Prisma: Prisma is already the data-access abstraction, a repository would duplicate its typed API for no gain.
- Never push to `main` or `production` directly: changes go through PRs and CI (enforced by `.claude/hooks/guard-bash.sh`, which also blocks force pushes and `prisma migrate reset`).

## More

- [docs/architecture.md](docs/architecture.md), [docs/conventions.md](docs/conventions.md), [docs/GLOSSARY.md](docs/GLOSSARY.md)
- Topic docs (auto-loaded as rules): `docs/{api,authentication,authorization,components,database,emails,flags,i18n,jobs,logging,redis,routes,services,storage,testing,tracing}.md`
