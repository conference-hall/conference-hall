import { getSharedServerEnv } from '@conference-hall/shared/environment.ts';
import { SitemapStream, streamToPromise } from 'sitemap';
import { RedisCacheLayer } from '~/shared/cache/redis-cache-layer.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { getEventsForSitemap } from './services/sitemap.server.ts';

const { APP_URL } = getSharedServerEnv();

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
const cache = new RedisCacheLayer({ prefix: 'seo:', ttl: ONE_WEEK_IN_SECONDS });

export async function loader() {
  const isSeoEnabled = await flags.get('seo');

  if (!isSeoEnabled) {
    return new Response(null, { headers: { 'Content-Type': 'application/xml' } });
  }

  // Try to get cached sitemap
  const cachedSitemap = await cache.get('sitemap');
  if (cachedSitemap) {
    return new Response(Buffer.from(cachedSitemap, 'utf-8'), { headers: { 'Content-Type': 'application/xml' } });
  }

  // Build the sitemap
  const stream = new SitemapStream({ hostname: APP_URL });

  // Add events to sitemap
  const events = await getEventsForSitemap();
  for (const event of events) {
    if (event.logoUrl) {
      stream.write({ url: `/${event.slug}`, changefreq: 'weekly', priority: 0.5, img: event.logoUrl });
    } else {
      stream.write({ url: `/${event.slug}`, changefreq: 'weekly', priority: 0.5 });
    }
  }

  stream.end();

  // Generate the sitemap and cache it
  const sitemapBuffer = (await streamToPromise(stream)) as Buffer<ArrayBuffer>;
  await cache.set('sitemap', sitemapBuffer.toString('utf-8'));

  return new Response(sitemapBuffer, { headers: { 'Content-Type': 'application/xml' } });
}
