> Read this file when: you question why services call Prisma directly, or want to add a data-access layer.

# 0001: Services call Prisma directly, no repository layer

Status: accepted (documents the existing design, 2026-11-08).

## Context

Business logic lives in service classes under `app/features/<area>/services/*.server.ts`. They need to read and write Postgres, check permissions and sometimes run transactions.

Prisma already gives a typed client generated from `prisma/schema.prisma`, with query composition, relations, transactions and client extensions (`prisma/extensions/`) for domain helpers on models.

Tests run against a real Postgres database (truncated after each test) with data built by `tests/factories/`, so there is no need to swap the data layer for a fake.

## Decision

Services import the `db` singleton from `prisma/db.server.ts` and call Prisma methods directly. There is no repository, DAO or data-mapper class between a service and Prisma, and the DB client is never injected through constructors.

Transactions pass the `DbTransaction` type from `prisma/db.server.ts` to helpers that must run inside one.

## Consequences

- One less layer to write and keep in sync: Prisma is already the data-access abstraction, and a repository would duplicate its typed API for no gain.
- Query shapes are visible where the business rule uses them, which keeps services readable on their own.
- Services are coupled to Prisma. Replacing the ORM would touch every service; this is accepted.
- Testing a service means using the test database and factories, not mocks of a data layer.
- Domain helpers shared across services go into Prisma client extensions or into exported functions in `services/`, not into a new layer.

See `docs/services.md` (Database Access) and `docs/database.md`.
