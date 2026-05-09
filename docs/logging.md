---
description: Logging on backend
paths:
  - '**/*.ts'
---

# Logging

## Shared Logger

Use shared logger from `~/shared/logger/logger.server.ts` for all server-side logging. Never use `console.log/info/warn/error` directly (except in `servers/environment.server.ts` where logger isn't available yet).

```typescript
import { logger } from '~/shared/logger/logger.server.ts';

logger.debug('message', { key: value });
logger.info('message', { key: value });
logger.warn('message', { key: value });
logger.error('message', { error });
```

## Log Levels

- `debug` — Verbose development info
- `info` — Normal operations (startup, shutdown, completed jobs)
- `warn` — Recoverable issues (auth failures, Firebase errors)
- `error` — Failures requiring attention

Configured via `LOG_LEVEL` env var (default: `info`, test: `error`).

## Error Logging

Pass errors in `{ error }` field. Logger serializes `message`, `stack`, `cause` automatically — works with `Error` instances and unknown values.

```typescript
} catch (error) {
  logger.error('Operation failed', { error });
}
```

## Output Formats

- **Production**: JSON to stdout (structured, one line per entry)
- **Development/Test**: Pretty-printed with colored level tags
- HTTP requests: dedicated format in dev: `status - METHOD url duration`

## Architecture

- `app/shared/logger/logger.server.ts` — Logger singleton and API
- `app/shared/logger/formatters.server.ts` — JSON and pretty formatters
