import { PassThrough } from 'node:stream';
import { getHeapSnapshot } from 'node:v8';

export const loader = async () => {
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
