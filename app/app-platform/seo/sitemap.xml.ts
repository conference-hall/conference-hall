import { SitemapStream, streamToPromise } from 'sitemap';
import { appUrl } from '~/shared/env.server.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { getEventsForSitemap } from './services/sitemap.server.ts';

let sitemap: Buffer; // TODO: Cache to Redis with a TTL (weekly)

export async function loader() {
  const isSeoEnabled = await flags.get('seo');

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
  streamToPromise(stream).then((sm) => {
    sitemap = sm;
    return sitemap;
  });

  stream.end();

  // @ts-expect-error
  return new Response(stream, { headers: { 'Content-Type': 'application/xml', Connection: 'keep-alive' } });
}
