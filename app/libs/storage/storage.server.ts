import stream from 'node:stream';
import type { FileUpload, FileUploadHandler } from '@mjackson/form-data-parser';
import { v4 as uuid } from 'uuid';
import { storage } from '../../shared/auth/firebase.server.ts';
import { appUrl } from '../../shared/env.server.ts';

type StorageUploaderOptions = { name: string; maxFileSize?: number };

const CONTENT_TYPES: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function uploadToStorageHandler(options: StorageUploaderOptions): FileUploadHandler {
  return (file) => {
    if (file.fieldName !== options.name) return;
    if (!Object.keys(CONTENT_TYPES).includes(file.type)) return;

    const extension = CONTENT_TYPES[file.type];
    const filepath = `${uuid()}.${extension}`;

    return uploadToStorage(file, filepath, options.maxFileSize);
  };
}

async function uploadToStorage(file: FileUpload, filepath: string, maxFileSize = 1_000_000) {
  const storedFile = storage.bucket().file(filepath);

  let size = 0;
  const chunks: Uint8Array[] = [];
  const passthroughStream = new stream.PassThrough();
  const reader = file.stream().getReader();
  while (size < maxFileSize) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    chunks.push(value);
    passthroughStream.write(value);
  }
  passthroughStream.end();

  try {
    await new Promise((resolve, reject) => {
      const writeStream = storedFile.createWriteStream();
      passthroughStream.pipe(writeStream).on('finish', resolve).on('error', reject);
    });
  } catch (_error) {
    passthroughStream.destroy();
    return null;
  }

  return new File(chunks, getStorageProxyUrl(filepath), { type: file.type });
}

function getStorageProxyUrl(filepath: string) {
  return `${appUrl()}/storage/${filepath}`;
}
