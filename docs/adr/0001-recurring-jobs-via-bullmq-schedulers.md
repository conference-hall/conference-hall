# Recurring jobs via BullMQ Job Schedulers

To deliver the daily **conversation digest** ([[conversation-digest]]) we needed the
platform's first _recurring_ background job. Every existing job is one-shot
(`queue.add` via the `job()` helper, triggered from business logic). We decided to add
recurring support by extending the `job()` helper with an optional cron `repeat`
config and registering it as a BullMQ **Job Scheduler** on worker startup, rather than
introducing an external/system cron that calls an authenticated endpoint.

## Considered Options

- **BullMQ Job Scheduler (chosen)** — native to the existing BullMQ/Redis stack, no new
  dependency or deployment surface, the schedule lives in Redis and survives restarts,
  and it reuses the same worker, retry, and logging machinery as every other job.
- **External / system cron → secured endpoint** — would decouple scheduling from the
  app but adds an ops surface, a secured trigger route, and a second way to run jobs
  that doesn't match how anything else in the codebase works.
- **Self-rescheduling job** (re-trigger with a delay at the end of each run) — no infra
  change, but prone to clock drift and to spawning duplicate schedules across restarts
  and deploys; hard to reason about.

## Consequences

- The digest job is a thin orchestrator: it scans for unread messages and fans out one
  `sendEmail` job per recipient, keeping heavy work off the single-concurrency worker.
- This establishes the pattern for any future periodic work (reminders, cleanups). New
  recurring jobs should declare a `repeat` config rather than reinventing scheduling.
