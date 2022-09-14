import stream from 'node:stream';
import * as admin from 'firebase-admin';
import type { UploadHandler } from '@remix-run/node';

type StorageUploaderOptions = { name: string; path: string; maxFileSize?: number };

export function uploadToStorageHandler(options: StorageUploaderOptions): UploadHandler {
  return async ({ name, data, contentType }) => {
    if (name !== options.name) return;
    if (contentType !== 'image/jpeg') return;
    const filepath = `${options.path}/${name}.jpg`;
    return await uploadToStorage(data, filepath, options.maxFileSize);
  };
}

async function uploadToStorage(data: AsyncIterable<Uint8Array>, filepath: string, maxFileSize: number = 1_000_000) {
  const storage = admin.storage();
  const file = storage.bucket().file(filepath);

  const passthroughStream = new stream.PassThrough();
  let size = 0;
  for await (const chunk of data) {
    size += chunk.byteLength;
    if (size > maxFileSize) {
      throw new MaxFileSizeExceededError();
    }
    passthroughStream.write(chunk);
  }
  passthroughStream.end();

  try {
    passthroughStream.pipe(file.createWriteStream());
  } catch (e) {
    throw new UploadingError();
  }
  return file.publicUrl();
}

export class UploadingError extends Error {
  message: string;
  constructor(message: string = 'An error occurred during file upload.') {
    super();
    this.message = message;
  }
}

class MaxFileSizeExceededError extends UploadingError {
  constructor() {
    super('Max file size exceeded.');
  }
}
