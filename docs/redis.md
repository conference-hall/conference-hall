---
description: Redis usage and version requirements
paths:
  - app/shared/cache/**
  - app/shared/jobs/connection.ts
  - compose.yml
---

# Redis Conventions

## Client

- Single process-wide client in `app/shared/cache/redis.server.ts`, created from `REDIS_URL`
- Shared by all consumers, including BullMQ via `app/shared/jobs/connection.ts`
- BullMQ workers duplicate that client for their blocking connection, so the jobs process holds two connections
- `connect()` is not awaited so boot never blocks when Redis is down
- `commandOptions.timeout` is explicitly `undefined`: commands stay queued during a reconnect instead of failing
- node-redis v6 defaults to RESP3, no explicit `RESP` option is set

## What Redis Stores

| Prefix           | Purpose                                                                                             | TTL                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `auth:*`         | Sessions, verification tokens, auth rate limit counters (see [authentication](./authentication.md)) | per key, and a `0` or absent ttl writes no expiry at all (`auth.server.ts`) |
| `bull:default:*` | BullMQ job queue (see [jobs](./jobs.md))                                                            | no                                                                          |
| `flag:*`         | Feature flag values (see [flags](./flags.md))                                                       | no                                                                          |
| `seo:*`          | Sitemap cache                                                                                       | 7 days                                                                      |

Only `seo:*` rebuilds on its own. Everything else is lost for good when Redis is flushed:

- Sessions live **only** in Redis. `secondaryStorage` is set without `session.storeSessionInDatabase`, so nothing is mirrored to Postgres and a flush signs every user out.
- Queued jobs are dropped outright.
- Flags fall back to the `defaultValue` declared in `flags.config.ts` when a key is missing, so a flush silently resets enabled flags to their defaults.

## Version Requirements

Minimum server version is **7.0**. Current target is **8.2**.

- `EXPIRE ... NX` in the auth rate limit counter (`auth.server.ts`) requires 7.0
- BullMQ requires 5.0 and recommends 6.2
- Redis 8 folds the Search, JSON, TimeSeries and probabilistic modules into core. Their commands are now part of the `@read`, `@write` and `@dangerous` ACL categories: audit custom ACL rules before upgrading a server that has any

## Eviction Policy

`maxmemory-policy` must stay `noeviction`. Any other policy drops sessions and queued jobs without error.

`noeviction` is the Redis default, and setting `maxmemory` does not change it, it only makes the policy take effect. Managed providers may ship a different default, so check the policy rather than assume it.

## Local and Test Setup

- Provisioned by `compose.yml`, no volume, data is ephemeral
- Server tests run with a single worker and `FLUSHDB` between tests (`tests/setup.server.ts`)
- Jobs are mocked in unit and integration tests. Only Playwright e2e runs a real worker through Redis
