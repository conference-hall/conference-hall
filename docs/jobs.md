---
description: Background job system
paths:
  - app/shared/jobs/**
  - app/shared/emails/*.job.ts
  - app/features/**/jobs/**
  - servers/jobs.ts
---

# Background Job Conventions

## Job Definition

- Define jobs using `job<Payload>()` from `~/shared/jobs/job.ts`
- Job file naming: `{name}.job.ts`
- Each job must have unique `name` string
- Payload types must be serializable (no functions, symbols, class instances)
- Keep payloads small — store large data in DB, pass only IDs

```typescript
import { job } from '~/shared/jobs/job.ts';

export const myJob = job<MyPayload>({
  name: 'my-job-name',
  queue: 'default',
  run: async (payload) => {
    /* job logic */
  },
});
```

## Job Location

- Shared jobs (e.g., emails): `app/shared/emails/send-email.job.ts`
- Feature-specific: `app/features/{feature}/services/jobs/{name}.job.ts`
- All jobs must be explicitly registered in `servers/jobs.ts` — no auto-discovery

## Triggering Jobs

- Trigger from services or auth flows: `await myJob.trigger(payload)`
- Fire-and-forget: `void myJob.trigger(payload)`
- Pass BullMQ options for delay or deduplication:

```typescript
await myJob.trigger(payload, {
  delay: 5 * 60 * 1000,
  deduplication: { id: uniqueId, ttl: delay, extend: true, replace: true },
});
```

- Bulk triggers: `Promise.all()` with array of `trigger()` calls

## Error Handling

- Jobs retry automatically: 5 attempts with exponential backoff (3s initial delay)
- Guard clauses to return early when preconditions unmet — don't throw for expected states
- Let unexpected errors throw — BullMQ handles retries

## Testing

- Jobs globally mocked in `tests/setup.server.ts` — `trigger` is `vi.fn()` spy
- Test job logic directly via `myJob.config.run(payload)`
- Verify triggers: `expect(myJob.trigger).toHaveBeenCalledWith(expectedPayload)`
- Test files: `{name}.job.test.ts`
