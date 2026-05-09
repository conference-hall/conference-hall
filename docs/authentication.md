---
description: Authentication setup
  - app/auth.server.ts
  - app/shared/authentication/**
  - app/shared/better-auth/**
  - app/features/auth/**
---

# Authentication (better-auth)

## Server Configuration

Configured in `app/auth.server.ts`:

- Prisma adapter with PostgreSQL
- Redis as secondary storage (sessions, rate limiting)
- Email/password with email verification required
- Social providers: Google, GitHub, Twitter (X)
- Cloudflare Turnstile captcha (via `captcha` plugin, when `CAPTCHA_SECRET_KEY` set)
- Test mode: `testUtils()` plugin enabled, passwords stored plain text

## Client

`app/shared/better-auth/auth-client.ts` exports:

- `authClient` — better-auth React client (`createAuthClient()`)
- `PROVIDERS` — array of social provider configs (id, label, icon)
- `getAuthError(error)` — maps better-auth error codes to i18n translation keys

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
- Migration script: `tsx scripts/migrate-firebase-to-better-auth.ts <firebase-users.json>`

## Database Tables

better-auth tables (managed via Prisma migrations):

- `account` — provider accounts (credential, google, github, twitter)

Redis (secondary storage):

- `session` — active sessions
- `verification` — email verification and password reset tokens
