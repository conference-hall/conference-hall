import { storage as firebaseStorage } from '~/shared/authentication/firebase.server.ts';
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
  } catch {
    // S3 lookup failed — fall back to Firebase Storage for files not yet migrated
    logger.info('File not found in S3, trying Firebase Storage', { key });
  }

  try {
    const file = firebaseStorage.bucket().file(key);
    const [exists] = await file.exists();
    if (!exists) throw new Response('File not found', { status: 404 });

    const [metadata] = await file.getMetadata();
    const stream = file.createReadStream();
    const contentType = metadata.contentType ?? 'application/octet-stream';
    const contentLength = metadata.size != null ? Number(metadata.size) : null;

    // @ts-expect-error Node Readable is compatible with Response body
    return new Response(stream, { headers: buildResponseHeaders(contentType, contentLength) });
  } catch (error) {
    if (error instanceof Response) throw error;
    logger.error('Error getting file from Firebase Storage', { error });
    throw new Response('File not found', { status: 404 });
  }
};
