> Read this file when: you add a process, a feature folder, or cross a layer boundary.

# Architecture

## Two processes, one codebase

The app runs as two Node processes that share `app/` and `prisma/`: the web server (`servers/web.ts`) and the jobs worker (`servers/jobs.ts`). `pnpm dev` starts both.

The web server is Fastify mounting React Router in SSR mode. Cross-cutting HTTP concerns live in Fastify plugins under `servers/fastify/` (security headers, rate limits, SEO headers, URL cleaning, static cache), not in React Router middleware.

The worker is a BullMQ process. Every job is registered explicitly in `servers/jobs.ts`; the web process only enqueues them. See `docs/jobs.md`.

Both processes load OpenTelemetry before any app code through `--import` (`servers/otel.web.ts`, `servers/otel.jobs.ts`). See `docs/tracing.md`.

## Layers inside a request

A request goes through three layers, and each one has a single job:

1. **Route module** (`app/features/<area>/*.tsx`): declares its middleware chain, parses input in the loader or action, calls a service, returns data. No DB access.
2. **Service** (`app/features/<area>/services/*.server.ts`): business rules, permission checks (`permissions.canXxx`) and all Prisma calls, through the `db` singleton from `prisma/db.server.ts`.
3. **Prisma** (`prisma/`): schema, migrations and client extensions in `prisma/extensions/` for domain helpers attached to models.

Authorization is resolved before the loader runs. The middleware chain (`requireAuth → requireAuthorizedTeam → requireAuthorizedEvent`) puts typed contexts on `context`, and the route passes them to `Service.for(context)`. See `docs/authorization.md` and `docs/services.md`.

There is no repository layer between services and Prisma: see [ADR 0001](adr/0001-services-without-repositories.md).

## Feature folders are vertical slices

`app/features/<area>/` groups everything for one product area: route modules at the top level, then `components/`, `services/`, `models/` (pure logic, no DB, unit-tested on its own), and sometimes `context/` or `store/` for client state.

Routes are not discovered from the file system: `app/routes.ts` declares them all and points to the route modules. Run `pnpm tsc` after editing it so the generated `./+types/*` exist.

## Shared code

- `app/shared/`: cross-feature infrastructure (auth, authorization, cache, jobs, emails, i18n, storage, feature flags, logger, otel).
- `app/design-system/`: the UI kit (Tailwind, CVA `cx()`, HeadlessUI). See `docs/components.md`.
- `app/app-platform/`: app shell, SEO, legal pages, healthcheck and the storage proxy route.

## External services

Postgres (Prisma), Redis (sessions, cache, flags, BullMQ queue), S3-compatible storage and an SMTP or Mailgun provider. Locally, `compose.yml` provides Postgres, Redis, Garage for S3 and Mailpit. See `docs/redis.md`, `docs/storage.md`, `docs/emails.md`.
