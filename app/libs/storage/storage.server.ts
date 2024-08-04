import stream from 'node:stream';

import type { UploadHandler } from '@remix-run/node';
import { v4 as uuid } from 'uuid';

import { storage } from '../auth/firebase.server.ts';
import { appUrl } from '../env/env.server.ts';

type StorageUploaderOptions = { name: string; maxFileSize?: number };

const CONTENT_TYPES: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function uploadToStorageHandler(options: StorageUploaderOptions): UploadHandler {
  return async ({ name, data, contentType }) => {
    if (name !== options.name) return;
    if (!Object.keys(CONTENT_TYPES).includes(contentType)) return;

    const extension = CONTENT_TYPES[contentType];
    const filepath = `${uuid()}.${extension}`;
    return await uploadToStorage(data, filepath, options.maxFileSize);
  };
}

async function uploadToStorage(data: AsyncIterable<Uint8Array>, filepath: string, maxFileSize = 1_000_000) {
  const file = storage.bucket().file(filepath);

  const passthroughStream = new stream.PassThrough();
  let size = 0;
  for await (const chunk of data) {
    size += chunk.byteLength;
    if (size > maxFileSize) {
      passthroughStream.destroy();
      return null;
    }
    passthroughStream.write(chunk);
  }
  passthroughStream.end();

  try {
    passthroughStream.pipe(file.createWriteStream());
  } catch (e) {
    passthroughStream.destroy();
    return null;
  }

  return getStorageProxyUrl(filepath);
}

function getStorageProxyUrl(filepath: string) {
  return `${appUrl()}/storage/${filepath}`;
}
