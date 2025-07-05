import { PassThrough } from 'node:stream';
import { getHeapSnapshot } from 'node:v8';
import { needsAdminRole } from '~/.server/admin/authorization.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/heap-snapshot.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  await needsAdminRole(userId);
  const snapshotStream = getHeapSnapshot();
  const passThrough = new PassThrough();

  snapshotStream.on('data', (chunk) => passThrough.write(chunk));
  snapshotStream.on('end', () => {
    passThrough.end();
    snapshotStream.destroy();
  });
  snapshotStream.on('error', () => {
    passThrough.destroy();
    snapshotStream.destroy();
    throw new Response('Error generating heap snapshot', { status: 500 });
  });

  // @ts-expect-error
  return new Response(passThrough, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="web-server.heapsnapshot"',
    },
  });
};
