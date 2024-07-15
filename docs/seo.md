# SEO

## Meta tags

Remix has built-in support for setting up `meta` tags on a per-route basis. [Source](https://remix.run/docs/en/main/route/meta).

When `SEO_ENABLED` environment variable is set to `false`, the `meta` `{ name: 'robots', content: 'noindex' }` is added.

## Sitemap.xml and robots.txt

When `SEO_ENABLED` environment variable is set to `true`:

- `/sitemap.xml` is enabled and contains URLs to all events with an opened CFP
- `/robots.txt` allows user agents for event routes but disallow the rest of the app routes

When `SEO_ENABLED` environment variable is set to `false`:

- `/sitemap.xml` is empty
- `/robots.txt` disallow all app routes for all user agents

## Social cards

Events social cards are generated thanks to `app/libs/meta/social-cards.ts`
