---
name: db-migration
description: Changes the Prisma data model end to end (schema.prisma, migration, client, test factories, seed), then verifies with the tests. Use when a task adds, renames or removes a model, field, relation, index or enum.
---

# Database migration

Schema conventions (CUID, snake_case `@@map`, `createdAt`/`updatedAt`, relations, indexes) are in `docs/database.md`, loaded automatically on `prisma/**`.

## Steps

1. Start Docker (`docker compose up`) if Postgres is not already running.
2. Edit `prisma/schema.prisma`. The `prisma-generate.sh` hook formats the schema and regenerates the client on every edit.
3. Create the migration: `pnpm db:migrate:dev --name="<snake_case_description>"`, one per change (e.g. `add_submission_passes`).
4. Open the generated `migration.sql` in `prisma/migrations/<timestamp>_<name>/`:
   - check that no `NOT NULL` column is added without a default on an existing table;
   - add the SQL backfill needed when existing data must be transformed.
5. Update the model's factory in `tests/factories/` (new required field, a trait if the state is common).
6. Update `prisma/seed.ts` if the field is required or useful for the local demo.
7. Adapt the services and their Zod schemas (`*.schema.server.ts`) that read or write the model.
8. Run `pnpm test:db` to push the schema to the test DB.
9. Run `pnpm test:unit run <file>` on each test of the touched services, then `pnpm check`.
10. Commit the schema, migration, factories and seed together.

## Forbidden

- Never run `pnpm db:reset` without approval: it wipes the local dev DB.
- Never edit a migration already on `main`: create a new migration.
