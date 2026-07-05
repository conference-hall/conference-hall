# Shared pino logger delivered through AsyncLocalStorage

The web server (Fastify) and the jobs server share a single pino instance created in
`app/shared/logger/logger.server.ts`. The exported `logger` is a Proxy that delegates to a
context logger stored in an `AsyncLocalStorage` when one is set (`runWithLogger`), and to the
base instance otherwise. Fastify puts `request.log` (which carries the `reqId`) into that
storage for the whole request lifecycle, and the job worker does the same with a child logger
bound to `{ jobId, jobName, queue }` — so every log emitted from loaders, actions, services or
job handlers is automatically correlated without threading a logger through call signatures.

## Considered Options

- **Explicit logger passing** (via `RouterContextProvider` / function parameters): rejected —
  it changes the signature of every service and breaks the plain `import { logger }` usage.
- **Facade keeping the old `(message, data)` API on top of pino**: rejected — two logging APIs
  would coexist (the facade vs. pino-native `request.log`), and the facade would drift from
  pino over time. Call sites use the pino-native `logger.error({ error }, 'message')` order.

## Consequences

- Log calls made outside any request/job context (startup, shutdown, process handlers) fall
  back to the base logger and carry no correlation fields.
- `vi.spyOn(logger, ...)` does not work reliably on the Proxy; tests assert on log output by
  injecting a pino destination stream via `createLogger({ destination })` instead.
