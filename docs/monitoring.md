# Monitoring

This document describes how to set up [Sentry](https://sentry.io/) (the application monitoring provider) for error, performance, and replay monitoring.

Inspired by: https://github.com/epicweb-dev/epic-stack/

## Setup

Once you see the onboarding page which has the DSN, copy that in `SENTRY_DSN` environment variable.

## Sentry release and sourcemap

The Sentry release and source maps upload are managed on app build with `@sentry/vite-plugin`.

To setup on Sentry, click [this](https://sentry.io/orgredirect/settings/:orgslug/developer-settings/new-internal/) to create an internal integration. Give it a name and add the scope for `Releases:Admin` and `Organization:Read`. Press Save, find the auth token at the bottom of the page under "Tokens", and copy that to secure location (this becomes `SENTRY_AUTH_TOKEN`). Then visit the organization settings page and copy that organization slug (`SENTRY_ORG_SLUG`).

Set the following secrets to the build server:

```
SENTRY_AUTH_TOKEN=<auth_token>
SENTRY_ORG=<org_slug>
SENTRY_PROJECT=javascript-remix
```
