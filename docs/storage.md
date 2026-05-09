---
description: File storage patterns and conventions (S3)
paths:
  - app/shared/storage/**
  - app/app-platform/storage/**
---

# File Storage Conventions

## Architecture

- **S3-compatible storage**: MinIO locally
- **Client singleton**: `app/shared/storage/s3-client.server.ts` — single `S3Client` with `forcePathStyle: true`
- **Service**: `app/shared/storage/storage.server.ts` — `StorageService` class with `upload`, `getObject`, `delete`, `deleteQuietly`
- **URL resolution**: `app/shared/storage/storage-utils.ts` — `resolveStorageUrl()` converts bucket keys to proxy URLs
- **Proxy route**: `app/app-platform/storage/storage.ts` — serves files from S3 with immutable cache headers
- **Upload handler**: `app/app-platform/storage/services/storage.server.ts` — multipart form upload to S3, includes `generateStorageKey()` internally

## Storage Keys (not URLs)

Store **bucket keys** in DB, not full URLs. Keys follow entity-scoped folder structure:

```
<entityType>/<entityId>/<fileName>-<hash>.<ext>
```

- `generateStorageKey(entityType, entityId, fileName, extension)` generates keys with random hash for cache busting
- `resolveStorageUrl(key)` converts key to proxy URL (`/storage/<key>`), passes through `data:` URIs

## Resolution Pattern

Resolve storage keys to URLs at **service boundary** (where DB data returned to consumers), not in UI components:

```typescript
logoUrl: resolveStorageUrl(event.logo),
```

## Orphan Cleanup

When replacing file, delete previous from S3 after DB update succeeds. Use `deleteQuietly` (logs errors, doesn't throw):

```typescript
const current = await db.event.findUniqueOrThrow({ where: { id }, select: { logo: true } });
await db.event.update({ where: { id }, data: { logo: newKey } });
if (current.logo) await storage.deleteQuietly(current.logo);
```

## Environment Variables

```env
S3_ENDPOINT=http://127.0.0.1:9000   # MinIO locally, Railway Storage URL in prod
S3_BUCKET=conference-hall
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=auto
```

## Local Development

MinIO via `docker compose up`. Console UI at `http://localhost:9001` (minioadmin/minioadmin). `minio-setup` service auto-creates `conference-hall` bucket.
