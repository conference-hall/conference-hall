import { logger } from '~/shared/logger/logger.server.ts';
import { StorageService } from '~/shared/storage/storage.server.ts';
import type { Route } from './+types/storage.ts';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function buildResponseHeaders(contentType: string, contentLength?: number | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Cache-Control': `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
    'Cross-Origin-Resource-Policy': 'cross-origin',
  };
  if (contentLength != null) {
    headers['Content-Length'] = contentLength.toString();
  }
  return headers;
}

export const loader = async ({ params }: Route.LoaderArgs) => {
  const key = params['*'];
  if (!key) throw new Response('File not found', { status: 404 });

  try {
    const storage = StorageService.create();
    const { body, contentType, contentLength } = await storage.getObject(key);

    // @ts-expect-error Node Readable is compatible with Response body
    return new Response(body, { headers: buildResponseHeaders(contentType, contentLength) });
  } catch (error) {
    logger.warn('Error getting file from storage', { storageKey: key, error });
    throw new Response('File not found', { status: 404 });
  }
};
