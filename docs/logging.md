---
description: Logging on backend
paths:
  - '**/*.ts'
---

# Logging

## Shared Logger

Use the shared pino logger from `~/shared/logger/logger.server.ts` for all server-side logging.
Never use `console.log/info/warn/error` directly (except in `servers/environment.server.ts`
where the logger isn't available yet).

```typescript
import { logger } from '~/shared/logger/logger.server.ts';

logger.debug('message');
logger.info({ key: value }, 'message');
logger.warn({ key: value }, 'message');
logger.error({ error }, 'message');
```

The API is pino-native: the merging object comes **first**, the message second.

## Request and Job Context

The exported `logger` is context-aware:

- During an HTTP request, every log automatically carries the Fastify `reqId`.
- During a job execution, every log automatically carries `jobId`, `jobName` and `queue`.

This works through `AsyncLocalStorage`: `runWithLogger(contextLogger, fn)` makes
`contextLogger` the ambient logger for everything executed by `fn`. The Fastify server and the
job worker set this up — application code just imports `logger`.

## Log Levels

- `debug` — Verbose development info
- `info` — Normal operations (startup, shutdown, completed jobs)
- `warn` — Recoverable issues (auth failures, Firebase errors)
- `error` — Failures requiring attention

Configured via the `LOG_LEVEL` env var (`debug|info|warn|error|silent`). Defaults: `silent`
when `NODE_ENV=test`, `info` otherwise.

## Error Logging

Pass errors under the `error` key — always that key, never another. The pino serializer
(`errWithCause`) outputs `message`, `stack`, `type` and the full `cause` chain. The base
config also serializes the `err` key the same way, but only because Fastify internals log
errors under it — application code always uses `error`.

```typescript
} catch (error) {
  logger.error({ error }, 'Operation failed');
}
```

## HTTP Request Logging

Fastify's native request logging is disabled. A single line (no message, only fields) is
emitted per request by an `onResponse` hook in `servers/web.ts`, with `method`, `url`,
`status`, `duration` (ms) and the request `headers`. The `cookie` and `authorization` headers
are redacted by the base logger configuration.

The line's level follows the response status: `info` below 400, `warn` for 4xx, `error` for 5xx.

## Output Formats

- **Production**: pino JSON to stdout (one line per entry, numeric `level`, epoch `time`, `msg`)
- **Development**: `pino-pretty` as a synchronous stream with a compact colored format; HTTP
  lines render as `GET /url 200 12ms` (method+url, status colored by range, duration)
- **Test**: silent by default (override with `LOG_LEVEL` when debugging a test)

## Architecture

- `app/shared/logger/logger.server.ts` — pino instance factory (`createLogger`), the
  context-aware `logger` export and `runWithLogger`
- `servers/web.ts` — Fastify wiring: `loggerInstance`, request context hook, `request completed`
  hook, error handler
- `app/shared/jobs/worker.ts` — job context wiring

## Testing

Don't spy on the shared `logger` (it's a Proxy). Capture log lines with the
`createLogCapture()` helper from `tests/logger-helpers.ts` instead:

```typescript
const { lines, loggerInstance } = createLogCapture();
```
