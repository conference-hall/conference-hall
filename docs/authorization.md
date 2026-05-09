---
description: Authentication and authorization model
paths:
  - app/shared/authentication/**
  - app/shared/authorization/**
  - app/features/**/layout.tsx
---

# Authentication & Authorization

## Middleware Chain

Authorization enforced via React Router v7 middleware arrays on route files. **Order matters** — each middleware reads from context set by previous:

```
optionalAuth → requireAuth → requireAuthorizedTeam → requireAuthorizedEvent
```

- **`optionalAuth`** — Resolves session if exists; sets `OptionalAuthContext` (may be `null`). App-level layout.
- **`requireAuth`** — Reads `OptionalAuthContext`; redirects to `/auth/login` if no user. Sets `RequireAuthContext`.
- **`requireAdmin`** — Reads `RequireAuthContext`; throws if not admin. Sets `AuthorizedAdminContext`.
- **`requireAuthorizedTeam`** — Reads `RequireAuthContext` + `params.team`; verifies membership, loads role/permissions. Sets `AuthorizedTeamContext`.
- **`requireAuthorizedEvent`** — Reads `AuthorizedTeamContext` + `params.event`; verifies event belongs to team. Sets `AuthorizedEventContext`.

## Context Pattern

Each middleware uses React Router's `createContext<T>()` to define typed context, `context.set()` to populate, `context.get()` to read upstream:

```typescript
import { createContext, type MiddlewareFunction } from 'react-router';

export const RequireAuthContext = createContext<AuthenticatedUser>();

export const requireAuth: MiddlewareFunction<Response> = async ({ request, context }) => {
  const user = context.get(OptionalAuthContext);
  if (!user) throw redirect('/auth/login');
  context.set(RequireAuthContext, user);
};
```

Loaders and actions consume context:

```typescript
export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedTeam = context.get(AuthorizedTeamContext);
  return TeamFetcher.for(authorizedTeam).get();
};
```

## Authorization Types

Defined in `app/shared/authorization/types.ts`:

- **`TeamRole`** — `'OWNER' | 'MEMBER' | 'REVIEWER'`
- **`TeamPermissions`** — Readonly object with boolean `canXxx` fields (e.g., `canEditTeam`, `canCreateEvent`, `canChangeProposalStatus`)
- **`AuthorizedTeam`** — `{ userId, teamId, role, permissions }`
- **`AuthorizedEvent`** — `AuthorizedTeam & { event: Event }`
- **`AuthorizedApiEvent`** — `{ event: Event }` (API key auth, no user context)

## Role Permissions

Permissions computed via `UserTeamPermissions.getPermissions(role)` in `app/shared/authorization/team-permissions.ts`:

| Capability             | OWNER | MEMBER | REVIEWER |
| ---------------------- | ----- | ------ | -------- |
| Edit team              | yes   | no     | no       |
| Create event           | yes   | no     | no       |
| Edit event / proposals | yes   | yes    | no       |
| Change proposal status | yes   | yes    | no       |
| Manage conversations   | yes   | no     | no       |
| Export proposals       | yes   | no     | no       |
| Leave team             | no    | yes    | yes      |

## API Authentication

For public API endpoints (no session auth), use `requireAuthorizedApiEvent`:

- Reads API key from `X-API-Key` header (preferred) or `key` query param (deprecated)
- Validates against event's stored `apiKey`
- Sets `AuthorizedApiEventContext` with `{ event }` (no user/team context)

```typescript
export const middleware = [requireAuthorizedApiEvent];
```

## Usage in Route Files

```typescript
// Team-level route
export const middleware = [requireAuth, requireAuthorizedTeam];

// Event-level route
export const middleware = [requireAuth, requireAuthorizedTeam, requireAuthorizedEvent];

// Admin route
export const middleware = [requireAuth, requireAdmin];

// API route (no session)
export const middleware = [requireAuthorizedApiEvent];
```
