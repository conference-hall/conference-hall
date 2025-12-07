import { data } from 'react-router';
import { getSharedServerEnv } from 'servers/environment.server.ts';
import { z } from 'zod';
import { i18nResources } from '~/shared/i18n/i18n.resources.ts';
import type { Route } from './+types/locales.ts';

const { NODE_ENV } = getSharedServerEnv();

const CACHE_MAX_AGE = 5 * 60; // Cache in the browser for 5 minutes
const CACHE_S_MAX_AGE = 24 * 60 * 60; // Cache in the CDN for 1 day
const CACHE_STALE_WHILE_REVALIDATE = 7 * 24 * 60 * 60; // Serve stale content while revalidating for 7 days
const CACHE_STALE_IF_ERROR = 7 * 24 * 60 * 60; // Serve stale content if there's an error for 7 days

export async function loader({ params }: Route.LoaderArgs) {
  const lng = z.enum(Object.keys(i18nResources) as Array<keyof typeof i18nResources>).safeParse(params.lng);

  if (lng.error) return data({ error: lng.error }, { status: 400 });

  const namespaces = i18nResources[lng.data];

  const ns = z.enum(Object.keys(namespaces) as Array<keyof typeof namespaces>).safeParse(params.ns);

  if (ns.error) return data({ error: ns.error }, { status: 400 });

  const headers = new Headers();

  // On production, we want to add cache headers to the response
  if (NODE_ENV === 'production') {
    headers.set(
      'Cache-Control',
      `max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}, stale-if-error=${CACHE_STALE_IF_ERROR}`,
    );
  }

  return data(namespaces[ns.data], { headers });
}
