# ADR 0001: Fastify web server with unbundled entry

Date: 2026-07-04

## Status

Accepted

## Context

The web server layer ran on Express with a split entrypoint setup: one entry for development
(Vite in middleware mode) and one for production (a Vite-bundled server entry), plus a shared
setup module and five hand-rolled middlewares. This doubled the boot surface to maintain,
required a custom Vite SSR `rollupOptions.input` override to bundle the production entry, and
kept the project on Express-specific packages (`express-rate-limit`, `helmet` wiring,
`compression`) whose Fastify equivalents are better maintained and better integrated.

The migration replaced Express with Fastify through the `@mcansh/react-router-fastify` adapter.
Two decisions taken along the way are hard to reverse and will surprise future readers; they are
recorded here.

## Decision 1: unbundled server entry with a `#nonce` package import

The server entry (`servers/web.ts`) exports a `createServer(vite?)` factory following the
adapter's canonical example, and self-listens when executed directly:

- Development runs `react-router dev`; the adapter's Vite plugin (`fastifyReactRouterDev`)
  loads the factory and mounts the Fastify app behind Vite's middleware.
- Production runs the same entry directly with Node 24's native TypeScript type-stripping
  (`node ./servers/web.ts`). There is no server-bundling step and no bundled-entry indirection.

Both the server entry and the app bundle need the CSP nonce React Router context token, and a
context token only works when both sides hold **the same module instance**. The nonce module is
therefore exposed as a `#nonce` subpath import declared in `package.json` `imports`:

- Node resolves `#` specifiers exclusively from `package.json`, and `moduleResolution: NodeNext`
  makes TypeScript read the same field, so one declaration serves tsc, Node, and Vite.
- The adapter plugin's `externalizeServerEntryImports: ['#nonce']` keeps the specifier external
  in the React Router SSR build: the built server bundle still contains
  `import { nonceContext } from "#nonce"`, so the server entry and the app bundle share one
  context token instance at runtime.

### Alternatives considered

- **Bundled server entry (status quo shape).** Keeps module identity trivially (one bundle) but
  preserves the custom SSR build override, the two boot paths, and a production entry that is
  hard to debug because it only exists post-build.
- **Manual nonce generation on both sides.** Avoids the shared module but duplicates the nonce
  logic and leaves the CSP header and the HTML nonce with no single source of truth.
- **tsconfig `paths` alias instead of `package.json` `imports`.** TypeScript-only: Node cannot
  resolve tsconfig paths at runtime, so the unbundled entry would crash in production.

## Decision 2: graceful shutdown without explicit database/Redis disconnects

On SIGINT/SIGTERM the server calls `app.close()` — draining in-flight requests — then
`process.exit(0)`, with a 10-second force-exit timer as a safety net. The Express server
additionally called `db.$disconnect()` and `disconnectRedis()`; those calls are deliberately
dropped.

Rationale: the process exit tears the sockets down anyway, and in-flight requests have already
completed before `close()` resolves, so explicit disconnects add nothing but an import of Prisma
and Redis into the server entry. Keeping the entry free of those imports keeps its module graph
small and its boot cheap. (The entry still reaches Redis transitively through the feature-flags
check for the SEO header — but as a consumer, not as a lifecycle owner.)

### Alternatives considered

- **Explicit disconnects in the entry (status quo).** Pulls Prisma/Redis into the entry's module
  graph solely for shutdown bookkeeping the OS already performs.
- **A shutdown hook exported through the server build.** Keeps the entry clean but couples the
  React Router build output to server lifecycle concerns and adds a second contract between the
  entry and the bundle.

## Consequences

- One server entry for dev and prod; the custom Vite SSR `rollupOptions.input` override and the
  `serverBuildFile` rename are gone, and the React Router build output is back to the adapter's
  default (`build/server/index.js`).
- The production start command is a plain `node ./servers/web.ts` with no `NODE_ENV` baked in;
  the runtime context (production platform, CI, Playwright) controls the environment.
- Every module reachable from `servers/web.ts` must be resolvable by plain Node: relative
  specifiers or package/subpath imports only — no `~/` tsconfig alias, and only erasable
  TypeScript syntax.
- Server-layer behaviors (CSP shape, rate-limit buckets, cache headers, redirects, logging) are
  pinned by Vitest injection tests against the `createServer()` factory
  (`servers/**/*.test.ts`), a seam the Express middlewares never had.
