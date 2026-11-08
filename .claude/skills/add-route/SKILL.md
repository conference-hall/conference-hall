---
name: add-route
description: Adds a React Router page or action (entry in app/routes.ts, module with middleware, loader and action, service, en and fr i18n keys, generated types, tests). Use when a task creates a new page, a new form endpoint or an API route.
---

# Adding a route

Detailed conventions are in `docs/routes.md`, `docs/authorization.md`, `docs/services.md` and `docs/i18n.md`, loaded automatically when you touch the matching files. For a public API route, also read `docs/api.md`.

## Steps

1. Pick the `app/features/<area>/` slice and name the module in kebab-case with the terms of `docs/GLOSSARY.md`.
2. Declare the route in `app/routes.ts` at the right nesting level, with an `id` if `useRouteLoaderData` or `href()` targets it.
3. Run `pnpm tsc` to generate `./+types/<module>.ts`.
4. Write the module in the order `meta`, `middleware`, `loader`, `action`, `handle`, component, `ErrorBoundary`:
   - `middleware`: the minimal chain (`requireAuth`, `requireAuthorizedTeam`, `requireAuthorizedEvent`);
   - `loader` / `action`: read the context, validate with `parseWithZod` and the intent pattern, call a service; no `db` access in the module.
5. Put the logic in a service `services/<name>.server.ts` (`Class.for(context)`, check `permissions.canXxx`) and its Zod schema in `services/<name>.schema.server.ts`.
6. Add every visible text to `app/locales/en.translation.json` and `app/locales/fr.translation.json`, then run `pnpm i18n:check`.
7. Write the tests:
   - `services/<name>.server.test.ts` for the service, with the factories from `tests/factories/`;
   - `*.test.tsx` for a component with logic;
   - a Playwright spec and its page object for a new user journey (can be delegated to the `e2e-writer` subagent).
8. Run `pnpm test:unit run <file>` on each test written, then `pnpm check`.
