# Monitoring

This document describes how to set up [Sentry](https://sentry.io/) (the application monitoring provider) for error, performance, and replay monitoring.

Inspired by: https://github.com/epicweb-dev/epic-stack/

## Setup

Once you see the onboarding page which has the DSN, copy that somewhere (this becomes `SENTRY_DSN`).
Then click
[this](https://sentry.io/orgredirect/settings/:orgslug/developer-settings/new-internal/)
to create an internal integration. Give it a name and add the scope for
`Releases:Admin`. Press Save, find the auth token at the bottom of the page
under "Tokens", and copy that to secure location (this becomes
`SENTRY_AUTH_TOKEN`). Then visit the organization settings page and copy that
organization slug (`SENTRY_ORG_SLUG`).

Set the secrets to the server:

```
SENTRY_DSN=<your_dsn>
SENTRY_AUTH_TOKEN=<your_auth_token>
SENTRY_ORG=<your_org_slug>
SENTRY_PROJECT=javascript-remix
```
