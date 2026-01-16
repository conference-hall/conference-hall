# Authorization System

Conference Hall uses a role-based authorization system with middleware integration to control access to teams and events.

## Overview

The authorization system has two layers:

1. **Team Authorization** - Controls access to teams based on team membership and roles
2. **Event Authorization** - Controls access to events within authorized teams

Authorization is enforced at the middleware layer (React Router v7) before business logic executes, ensuring consistent security across the application.

## Team Roles

Three roles exist with hierarchical permissions:

- `OWNER`
- `MEMBER`
- `REVIEWER`

## Core Authorization Functions

### `getAuthorizedTeam(userId, teamSlug)`

Validates that a user is a member of a team and returns an authorized context.

```typescript
const authorizedTeam = await getAuthorizedTeam(user.id, 'my-team');
// Returns: { userId, teamId, role, permissions }
```

**Validation:**

- User must be a team member
- Role must have `canAccessTeam` permission
- Logs authorization failures with context

**Throws:**

- `ForbiddenOperationError` - User is not a team member or lacks access

### `getAuthorizedEvent(authorizedTeam, eventSlug)`

Validates that a user can access an event within their authorized team.

```typescript
const authorizedEvent = await getAuthorizedEvent(authorizedTeam, 'my-event');
// Returns: { userId, teamId, role, permissions, event }
```

**Validation:**

- User must have `canAccessEvent` permission (all roles have this)
- Event must exist and belong to the authorized team (multi-tenancy isolation)
- Logs authorization failures and not-found cases

**Throws:**

- `ForbiddenOperationError` - User lacks `canAccessEvent` permission
- `EventNotFoundError` - Event doesn't exist or belongs to different team

## Middleware Pattern

Authorization is enforced using React Router middleware before route handlers execute.

### `requireAuthorizedTeam`

Validates team access and sets authorized team context.

```typescript
export const middleware = [requiredAuthMiddleware, requireAuthorizedTeam];
```

### `requireAuthorizedEvent`

Validates event access and sets authorized event context.

```typescript
export const middleware = [requiredAuthMiddleware, requireAuthorizedTeam, requireAuthorizedEvent];
```

### Middleware Chain

The middleware must be applied in order:

```typescript
requiredAuthMiddleware → requireAuthorizedTeam → requireAuthorizedEvent
```

Each middleware depends on the previous one's context.

## Usage in Services

Services receive pre-authorized contexts from middleware and perform permission checks for specific operations.

```typescript
export class EventSettings {
  static for(authorizedEvent: AuthorizedEvent) {
    return new EventSettings(authorizedEvent);
  }

  async update(data: EventUpdate) {
    // Permission check for specific operation
    if (!this.authorizedEvent.permissions.canEditEvent) {
      throw new ForbiddenOperationError();
    }

    // Business logic - authorization already validated
    await db.event.update({
      where: { id: this.authorizedEvent.event.id },
      data,
    });
  }
}
```

**Pattern:**

1. Middleware ensures user is authorized for the team/event
2. Service checks specific permission for the operation
3. Business logic executes with guaranteed authorization

## Permission Checking

### Team Permissions

```typescript
type TeamPermissions = {
  readonly canAccessTeam: boolean;
  readonly canEditTeam: boolean;
  readonly canDeleteTeam: boolean;
  readonly canManageTeamMembers: boolean;
  readonly canLeaveTeam: boolean;
  // ... event-related permissions
};
```

Check permissions before operations:

```typescript
if (!authorizedTeam.permissions.canEditTeam) {
  throw new ForbiddenOperationError();
}
await updateTeam(authorizedTeam.teamId, data);
```

### Getting Permissions

Permissions are derived from roles using `UserTeamPermissions`:

```typescript
const permissions = UserTeamPermissions.getPermissions(TeamRole.MEMBER);
// Returns full permission object for MEMBER role
```

### Testing Services

Services receive pre-authorized contexts, so tests focus on permission checks:

```typescript
it('throws an error if user role is not owner or member', async () => {
  const reviewer = await userFactory();
  const team = await teamFactory({ reviewers: [reviewer] });
  const event = await eventFactory({ team });

  const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
  const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

  await expect(async () => {
    await EventSettings.for(authorizedEvent).update({ name: 'Updated' });
  }).rejects.toThrowError(ForbiddenOperationError);
});
```

## Common Patterns

### Accessing Authorized Context in Routes

```typescript
// In a route component
export async function loader({ context }: Route.LoaderArgs) {
  const authorizedEvent = context.get(AuthorizedEventContext);

  // authorizedEvent contains: { userId, teamId, role, permissions, event }
  return { event: authorizedEvent.event };
}
```

## Security Considerations

1. **Always check permissions in services** - Middleware establishes authorization, but services must check specific operation permissions

2. **Never trust client-side authorization** - UI should hide/show based on permissions, but server must always validate

3. **Validate route parameters** - Middleware checks for required params to prevent configuration errors
