---
description: Feature flag system
paths:
  - flags.config.ts
  - app/shared/feature-flags/**
  - app/features/admin/feature-flags/**
---

# Feature Flag Conventions

## Flag Definition

- Define all flags in `flags.config.ts` via `defineFlagsConfig()`
- Each flag requires: `description`, `type` (`'boolean'`, `'number'`, `'string'`), `defaultValue`
- Use `tags: ['frontend']` to expose flag to client-side via `FlagsProvider`
- Adding/removing flags requires dev server restart

## Server-side Usage

- Import singleton: `import { flags } from '~/shared/feature-flags/flags.server.ts'`
- Read: `const value = await flags.get('flagName')` (async, typed)
- Set (admin only): `await flags.set('flagName', value)`
- All ops async (backed by Redis with `flag:` key prefix)

## Client-side Usage

- Only `'frontend'`-tagged flags available in components
- Loaded in root loader via `flags.withTag('frontend')`, passed to `<FlagsProvider>`
- Hooks from `~/shared/feature-flags/flags-context.tsx`:
  - `useFlag('flagName')` — get single flag value
  - `useFlags()` — get all frontend flags

## Storage and Admin

- Flags persisted in Redis (survives restarts)
- Admin manages at `/admin/flags`
- `flags.resetDefaults()` resets all to `defaultValue`
- Obsolete flags (removed from config) auto-cleaned on startup

## Testing

- Flags auto-reset to defaults before each test (E2E via fixtures, unit via setup)
- Override for specific test: `await flags.set('flagName', true)`
- No cleanup needed — reset happens before next test
