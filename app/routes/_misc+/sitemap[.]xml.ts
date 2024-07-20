import { SitemapStream, streamToPromise } from 'sitemap';

import { getEventsForSitemap } from '~/.server/seo/sitemap.ts';
import { appUrl } from '~/libs/env/env.server.ts';

const isSeoEnabled = process.env.SEO_ENABLED === 'true';

let sitemap: Buffer; // TODO: Cache to Redis with a TTL (weekly)

export async function loader() {
  if (!isSeoEnabled) {
    return new Response(null, { headers: { 'Content-Type': 'application/xml' } });
  }

  // if we have a cached entry send it
  if (sitemap) {
    return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });
  }

  // Build the sitemap
  const stream = new SitemapStream({ hostname: appUrl() });

  // Add events to sitemap
  const events = await getEventsForSitemap();
  for (const event of events) {
    if (event.logoUrl) {
      stream.write({ url: `/${event.slug}`, changefreq: 'weekly', priority: 0.5, img: event.logoUrl });
    } else {
      stream.write({ url: `/${event.slug}`, changefreq: 'weekly', priority: 0.5 });
    }
  }

  // cache the sitemap
  streamToPromise(stream).then((sm) => (sitemap = sm));

  stream.end();

  // @ts-expect-error
  return new Response(stream, { headers: { 'Content-Type': 'application/xml', Connection: 'keep-alive' } });
}
