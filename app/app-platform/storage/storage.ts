import { logger } from '~/shared/logger/logger.server.ts';
import { StorageService } from '~/shared/storage/storage.server.ts';
import type { Route } from './+types/storage.ts';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const loader = async ({ params }: Route.LoaderArgs) => {
  const key = params['*'];
  if (!key) throw new Response('File not found', { status: 404 });

  try {
    const storage = StorageService.create();
    const { body, contentType, contentLength } = await storage.getObject(key);

    // @ts-expect-error Node Readable is compatible with Response body
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength.toString(),
        'Cache-Control': `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    logger.error('Error getting file from storage', { error });
    throw new Response('File not found', { status: 404 });
  }
};
