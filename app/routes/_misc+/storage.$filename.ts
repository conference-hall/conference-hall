import { storage } from '../../libs/auth/firebase.server.ts';
import type { Route } from './+types/storage.$filename.ts';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// TODO: Extract into libs/storage/storage.server.ts
export const loader = async ({ params }: Route.LoaderArgs) => {
  const bucket = storage.bucket();
  const file = bucket.file(params.filename);

  const [exists] = await file.exists();
  if (!exists) {
    throw new Response('File not found', { status: 404 });
  }

  try {
    const [metadata] = await file.getMetadata();
    const stream = file.createReadStream();

    // @ts-expect-error
    return new Response(stream, {
      headers: {
        'Content-Type': metadata.contentType,
        'Content-Length': metadata.size?.toString(),
        'Cache-Control': `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });
  } catch (error) {
    console.log({ level: 'error', message: error });
    throw new Response('Internal Server Error', { status: 500 });
  }
};
