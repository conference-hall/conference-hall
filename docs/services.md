---
description: Service layer patterns and conventions
paths:
  - app/features/**/services/**
  - app/shared/**/*.server.ts
---

# Service Layer Conventions

## Static Factory Pattern

Every service class exposes one or two static factory methods instead of public constructor:

- **`ClassName.for(authorizedContext, ...args)`** — when service needs authorization context (team or event)
- **`ClassName.of(scalarId)`** — when service only needs scalar identifier (no authorization)

```typescript
export class ProposalReview {
  constructor(
    private authorizedEvent: AuthorizedEvent,
    private proposalId: string,
  ) {}

  static for(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new ProposalReview(authorizedEvent, proposalId);
  }
}

export class TalksLibrary {
  constructor(private speakerId: string) {}

  static of(speakerId: string) {
    return new TalksLibrary(speakerId);
  }
}
```

## Constructor Injection

- Accept authorization context (`AuthorizedTeam` or `AuthorizedEvent`) or scalar IDs as constructor params
- Store as `private` fields
- Never inject DB — use `db` singleton directly

## Database Access

Import `db` singleton from `prisma/db.server.ts`:

```typescript
import { db } from 'prisma/db.server.ts';
```

Use Prisma methods directly — no repository abstraction layer.

## Permission Checks

Check permissions at start of service methods by destructuring from authorization context:

```typescript
async create(data: EventCreateData) {
  const { userId, teamId, permissions } = this.authorizedTeam;
  if (!permissions.canCreateEvent) throw new ForbiddenOperationError();
  // ...
}
```

## Schema Co-location

Zod validation schemas in `*.schema.server.ts` files next to their service:

```
services/
  proposal-review.server.ts
  proposal-review.schema.server.ts
```

Export both schema and inferred type:

```typescript
export const ReviewUpdateDataSchema = z.object({
  note: z.number().min(0).max(5).nullable().default(null),
  feeling: z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']),
});

export type ReviewUpdateData = z.infer<typeof ReviewUpdateDataSchema>;
```

## Return Type Exports

Export complex return types from method signatures, not declared manually:

```typescript
export type ProposalReviewData = Awaited<ReturnType<typeof ProposalReview.prototype.get>>;

// For array element types:
export type Feed = Awaited<ReturnType<ActivityFeed['activity']>>;
export type FeedItem = Feed[number];
```

## Error Handling

- Throw domain-specific errors (e.g., `ForbiddenOperationError`, `NotFoundError`) from `~/shared/errors.server.ts`
- Never catch and swallow errors — let propagate to route error boundaries
- Custom errors extend `Response` for proper HTTP status codes

## File Organization

- One service class per file
- File named after class in kebab-case: `EventCreation` → `event-creation.server.ts`
- Keep services focused — split large services by responsibility
