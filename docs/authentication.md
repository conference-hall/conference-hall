---
description: Authentication setup
paths:
  - app/shared/authentication/**
  - app/features/auth/**
---

# Authentication (better-auth)

## Server Configuration

Configured in `app/shared/authentication/auth.server.ts`:

- Prisma adapter with PostgreSQL
- Redis as secondary storage (sessions, verifications, rate limiting)
- Email/password with email verification required
- Social providers: Google, GitHub
- Cloudflare Turnstile captcha (via `captcha` plugin, when `CAPTCHA_SECRET_KEY` set)
- Last login method hint (via `lastLoginMethod` plugin)
- Test mode: `testUtils()` plugin enabled, passwords stored plain text

## Client

`app/shared/authentication/auth-client.ts` exports:

- `authClient` — better-auth client (`createAuthClient()`)

Related modules in the same folder:

- `auth-providers.ts` — `PROVIDERS`, array of social provider configs (id, label, icon)
- `auth-errors.ts` — `getAuthError(error)`, maps better-auth error codes to i18n translation keys

Account-scoped client APIs (`unlinkAccount`, `accountInfo`) select an account with the
local `account.id`, not the provider-side `accountId`.

## Auth in Middleware

Session resolved via `auth.api.getSession({ headers })` in `optionalAuth` middleware.
Sign out uses `auth.api.signOut({ headers, returnHeaders: true })`.

## Auth Routes

Auth routes (`/auth/*`) handle sign-in, sign-up, email verification, password reset.
better-auth API mounted at `/api/auth/*`.

## Firebase Password Migration

Legacy Firebase scrypt password hashes supported for migration:

- Stored as `firebase-scrypt:<hash>:<salt>` in `account.password` field
- On successful verification, re-hashed with better-auth's native hash
- Requires `FIREBASE_SCRYPT_*` env vars

## Database Tables

better-auth tables (managed via Prisma migrations):

- `users` — user accounts (`image` mapped to `picture`, additional `locale` field)
- `accounts` — provider accounts (credential, google, github)

Redis (secondary storage), all keys prefixed `auth:`:

- `<session token>` — active sessions, plus `active-sessions-<userId>` indexes
- `verification:<identifier>` — email verification and password reset tokens
- rate limiting counters
