---
description: React Router v7 routing conventions
paths:
  - app/routes.ts
  - app/features/**/*.tsx
  - app/app-platform/**/*.tsx
---

# React Router v7 Conventions

## Route Configuration

- Routes defined programmatically in `app/routes.ts` via `route()` and `index()` helpers
- Parameters use colon notation: `route(':event', './features/event-participation/layout.tsx')`
- Assign route IDs for programmatic access: `{ id: 'event-page' }`
- Nested routes as child arrays in route config
- After adding/changing routes, run `pnpm tsc` to generate route types

## Route File Structure

Typical route file order:

1. `meta` — page title and SEO metadata
2. `middleware` — auth/authorization middleware array
3. `loader` — server-side data fetching
4. `action` — form mutation handling
5. `handle` — route handle metadata (e.g., breadcrumbs)
6. `default export` — React component
7. `ErrorBoundary` — error handling UI

## Type Safety

- Import generated types: `import type { Route } from './+types/filename.ts'`
- Use `Route.LoaderArgs`, `Route.ActionArgs`, `Route.ComponentProps`, `Route.MetaArgs`
- Access typed `loaderData`, `actionData`, `params` from `Route.ComponentProps`

## Loaders

- Route params via `params` object: `params.event`, `params.team`
- Auth/authorization via middleware contexts: `context.get(RequireAuthContext)`
- Return plain objects (not wrapped in `json()`)
- `throw redirect()` for server-side redirects
- `throw new Response(null, { status: 404 })` for error responses
- URL search params via `new URL(request.url).searchParams`

## Actions

- Read form data: `await request.formData()`
- **Intent pattern**: `form.get('intent')` with `switch` for multiple actions per route
- Validate with **Conform v4 + Zod**: `parseWithZod(form, { schema: SomeSchema })`
- Import: `import { parseWithZod } from '@conform-to/zod/v4'`
- Check `result.status !== 'success'` before processing
- Return `toast('error', message)` for error feedback or `null` on success
- Use `toastHeaders()` with `redirect()` to show toast after navigation

## Form Handling

- **`<Form>`**: Standard form submission with full page navigation
- **`useFetcher`**: Client-side submission without navigation (reviews, toggles, inline edits)
- **`useSubmit`**: Programmatic form submission
- `name="intent" value="action-name"` on submit buttons to differentiate actions
- Optimistic UI via `fetcher.formData` checks

## Navigation

- Type-safe `href()` for route paths: `href('/team/:team/:event', { team, event })`
- `<Link>` for declarative navigation
- `useNavigate()` for programmatic navigation
- `useSearchParams()` for query param state
- `useMatch()` for active route detection

## Middleware

- Array on route: `export const middleware = [requireAuth, requireAuthorizedTeam]`
- Execution follows array order
- Sets context values for loaders/actions via `context.set()`
- Auth: `RequireAuthContext`, `OptionalAuthContext`
- Authorization: `AuthorizedTeamContext`, `AuthorizedEventContext`, `AuthorizedAdminContext`

## Layouts

- Layout routes export default component with `<Outlet />` for nested rendering
- Layouts provide shared context via React Context providers (e.g., `CurrentEventTeamProvider`)
- Layout loaders run before nested route loaders

## Error Handling

- Use `<NestedErrorBoundary />` for route-level error boundaries
- Root `ErrorBoundary` in `app/root.tsx` catches unhandled errors
- `isRouteErrorResponse(error)` differentiates HTTP from unexpected errors
- Catch-all `*` route for 404 pages

## Meta and SEO

- Use `mergeMeta(args.matches, [...])` to combine parent and current meta tags
- Convention: `{ title: 'Page Name | Conference Hall' }`
