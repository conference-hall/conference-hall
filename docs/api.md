---
description: Public Web API for reading event proposals and schedule
paths:
  - app/features/event-management/settings/api.tsx
  - app/features/event-management/settings/components/api-tryout-section.tsx
  - app/features/event-management/proposals-export/api.tsx
  - app/features/event-management/schedule-export/api.tsx
  - app/shared/authorization/authorization.middleware.ts
  - servers/fastify/rate-limit.ts
---

# Web API

Conference Hall exposes a read-only **Web API** so organizers can connect external
services (websites, mobile apps, planners) to a single event. Each endpoint is
scoped to one event and authenticated with that event's API key.

The API is versioned under `/api/v1` and returns JSON.

## Where to find the API definition

The external documentation only covers the technical contract at a high level.
For the concrete endpoint definition, available filters, ready-to-run code
examples, and sample JSON responses, use the in-app page:

- **Event -> Settings -> Web API**
- Route implementation: `app/features/event-management/settings/api.tsx`
- UI reference and examples: `app/features/event-management/settings/components/api-tryout-section.tsx`

That settings page is the best reference for integrations because it builds the
examples from the current event slug, API key, and response serializers used by
the real API.

## Authentication

Every request requires an event **API key**.

- **Generate / revoke** the key from the event settings: **Event → Settings → Web API**
- **Send** the key in the `X-API-Key` header:

  ```sh
  curl -H "X-API-Key: <your-api-key>" "https://conference-hall.io/api/v1/event/<event-slug>"
  ```

Authentication is handled by the `requireAuthorizedApiEvent` middleware. There is no user or team
session for API requests. The key alone grants read access to that single event.

## Available endpoints

Conference Hall currently exposes two read-only event endpoints:

- `GET /api/v1/event/:event` to read event proposals.
- `GET /api/v1/event/:event/schedule` to read the published schedule.

The schedule endpoint is only available for `CONFERENCE` events. The settings
page shows the request format, query parameters, and example responses for each
endpoint.

## Rate limiting

API requests are limited to **60 requests per hour**, keyed per client IP. Responses include draft-spec rate-limit headers:

| Header                | Meaning                                  |
| --------------------- | ---------------------------------------- |
| `ratelimit-limit`     | Max requests allowed in the window       |
| `ratelimit-remaining` | Requests remaining in the current window |
| `ratelimit-reset`     | Seconds until the window resets          |

When the limit is exceeded the API responds with `429 Too Many Requests` and a
`retry-after` header. Rate limiting is effectively disabled in dev/test.

## Errors

| Situation                            | Status | Message                                                     |
| ------------------------------------ | ------ | ----------------------------------------------------------- |
| Missing API key                      | 403    | `API key is required`                                       |
| Unknown event slug                   | 404    | Event not found                                             |
| API key does not match the event     | 400    | `API key is invalid`                                        |
| Query-param auth used while disabled | 400    | Deprecation message, use the `X-API-Key` header instead     |
| Schedule requested on a MEETUP event | 403    | Forbidden, schedule is only available for CONFERENCE events |
| No schedule created for the event    | 404    | `No schedule found for event "<slug>"`                      |
| Rate limit exceeded                  | 429    | Too Many Requests                                           |
