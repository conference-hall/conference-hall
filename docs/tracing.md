---
description: OpenTelemetry tracing on the web and jobs services
paths:
  - servers/otel.*.ts
  - app/shared/otel/**
  - compose.yml
---

# Tracing

Distributed tracing with OpenTelemetry, on the web and the jobs services, behind a single
`OTEL_ENABLED` toggle. Traces only: no metrics, no OTEL logs, no `trace_id` in the pino logs.

Traces go to a local Jaeger in development, and to whatever OTLP receiver the hosting platform
provides in production.

## Local Development

1. `docker compose up` starts Jaeger. The UI is on <http://localhost:16686>.
2. `pnpm dev`. `OTEL_ENABLED=true` in `.env.local`, so tracing is on out of the box.

Exports **fail silently** when Jaeger is down: no error, no warning, just nothing to look at.

A cold `GET /` looks like this, 10 spans:

```
GET /                                  [app/react-router]  http.route=/  url.path=/
└─ middleware root                     [app/react-router]
   ├─ middleware root                  [app/react-router]
   ├─ loader root                      [app/react-router]
   └─ loader features/event-search/event-search
      ├─ prisma:client:operation → connect, db_query
      └─ prisma:client:operation → db_query
```

The react-router span is the **root** of the trace, and the only server span. There is deliberately
no HTTP or Fastify span above it: the Fastify catch-all collapses `http.route` to `*`, so those
spans named every request `GET *` and repeated what react-router already knew.

Enqueue a job and the web request and the worker run share **one** trace id.

An idle worker is **not** silent. `bullmq-otel` opens a long-lived `startStalledCheckTimer default`
span per worker and adds one `moveStalledJobsToWait default` child per 30 s tick, in a trace of its
own that never closes.

### What is not traced

- Static assets, `/favicon.ico`, `/site.webmanifest`, `/healthcheck` and `/__manifest` produce
  **zero** spans.
- Fastify lifecycle hooks and the Fastify layer as a whole.
- Incoming HTTP at the transport level. Anything that never reaches the react-router handler.
- `prisma:client:serialize` and `prisma:client:compile`.
- `better-auth`'s own spans.
- Redis, and `pg` under Prisma.

Outbound calls (S3, Mailgun, Slack, OpenPlanner, Turnstile) **are** traced: each is a child of the request that
triggered it. `instrumentation-http` covers for `node:https` directly, `instrumentation-undici` covers global `fetch`.

### Tests

`pnpm test` are unaffected: `tests/.env.test` sets `OTEL_ENABLED=false`.

## Production

The application reads the standard OTLP environment and configures nothing beyond them. Set
`OTEL_ENABLED=true` on both services; the platform supplies the rest:

| Variable                      | Read by                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | the exporter                                                        |
| `OTEL_SERVICE_NAME`           | the bootstrap, overriding the `web-server` / `jobs-server` defaults |

### Span budget

Measured, so you can compare them against your receiver's ingestion limit:

| Request                    | Spans                      |
| -------------------------- | -------------------------- |
| `GET /` (2 Prisma queries) | 10                         |
| `GET /auth/login`          | 5                          |
| Static asset               | 0                          |
| `/healthcheck`             | 0                          |
| `/__manifest`              | 0                          |
| Enqueue, jobs side         | 2 plus the job's own spans |
| Idle worker                | ~2 per minute              |

A cold page load costs 10 spans whatever its asset count, because assets are filtered out. The
binding constraint was readability, not any cap.

## Architecture

- `servers/otel.server.ts`: `startOtel()` / `shutdownOtel()` and the instrumentation list.
- `servers/otel.web.ts`, `servers/otel.jobs.ts`: `--import` entry points, one per service name.
- `app/shared/otel/react-router-otel.server.ts`: the root server span, the loader, action and
  middleware spans, the ignored-path filter and the incoming trace-context extraction.
- `app/shared/otel/bullmq-otel.server.ts`: the BullMQ integration, passed to both the `Queue` and the `Worker`.
- `trace.getTracer()` is available to application code for custom spans.
