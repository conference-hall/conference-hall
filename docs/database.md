---
description: Database conventions
paths:
  - prisma/**
  - app/**/services/*.server.ts
  - tests/factories/**
  - tests/db-helpers.ts
---

# Database Conventions

## Schema Design

- All models use **CUID** for primary keys: `id String @id @default(cuid())`
- Use `@@map("snake_case")` for table names and `@map("snake_case")` for columns
- Model names PascalCase, DB table/column names snake_case
- Every model must have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- Use `@default()` for sensible defaults: booleans, timestamps, JSON (`@default("[]")`, `@default("{}")`)

## Relations and Constraints

- Foreign keys must use explicit `@relation(fields: [...], references: [id])`
- Use `onDelete: Cascade` for dependent child records
- Add `@@index()` on all foreign key columns for JOIN optimization
- Use `@@unique()` for composite uniqueness constraints (e.g., `@@unique([talkId, eventId])`)
- Use composite `@@id()` for junction tables (e.g., `@@id([memberId, teamId])`)

## Soft Deletes and Archiving

- Use `deletedAt DateTime?` for soft-deletable records
- Use `archivedAt DateTime?` for archivable records

## Migrations

- All schema changes require migration: `npm run db:migrate:dev -- --name="descriptive_name"`
- After schema changes, run `npx prisma generate` to update Prisma Client
- One feature or change per migration

## Query Patterns

- All DB code must be in `.server.ts` files — no client-side access
- Use `select` for minimal fetching; `include` when related records needed
- Use `db.$transaction()` for all multi-table writes
- Reserve `$queryRaw` for complex analytics, metrics, or atomic ops (e.g., counters with `ON CONFLICT`)
- Use `skip`/`take` with `Pagination` utility for paginated queries
- Use `{ contains: query, mode: 'insensitive' }` for case-insensitive text search
- Use `orderBy` arrays for multi-field sorting: `orderBy: [{ type: 'desc' }, { name: 'asc' }]`

## Prisma Extensions

- Computed properties defined in `prisma/extensions/` via `Prisma.defineExtension()`
- Applied in `prisma/db.server.ts` via `$extends()`

## Prisma Client

- Singleton with global cache in `prisma/db.server.ts` (prevents connection leaks on hot reload)
- `DbTransaction` type exported for functions accepting transaction context

## Testing

- Use factory functions with traits for test data (see `tests/factories/`)
- DB globally truncated after each test — no manual cleanup needed
