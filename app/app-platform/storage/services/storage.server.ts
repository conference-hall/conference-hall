import type { FileUpload, FileUploadHandler } from '@remix-run/form-data-parser';
import { getSharedServerEnv } from 'servers/environment.server.ts';
import { v4 as uuid } from 'uuid';
import { storage } from '~/shared/authentication/firebase.server.ts';

const { APP_URL } = getSharedServerEnv();

type StorageUploaderOptions = { name: string };

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

    return uploadToStorage(file, filepath);
  };
}

async function uploadToStorage(file: FileUpload, filepath: string) {
  const storedFile = storage.bucket().file(filepath);

  try {
    const writeStream = storedFile.createWriteStream({ contentType: file.type });
    const reader = file.stream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      writeStream.write(value);
    }

    await new Promise((resolve, reject) => {
      writeStream.end();
      writeStream.on('finish', resolve).on('error', reject);
    });

    return new File([], getStorageProxyUrl(filepath), { type: file.type });
  } catch (_error) {
    return null;
  }
}

function getStorageProxyUrl(filepath: string) {
  return `${APP_URL}/storage/${filepath}`;
}
