import { randomUUID } from 'node:crypto';
import type { FileUpload, FileUploadHandler } from '@remix-run/form-data-parser';
import { StorageService } from '~/shared/storage/storage.server.ts';

type StorageUploaderOptions = { name: string; entityType: string; entityId: string; fileName: string };

const CONTENT_TYPES: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function uploadToStorageHandler(
  options: StorageUploaderOptions,
  storageKeyGenerator = generateStorageKey,
): FileUploadHandler {
  return (file) => {
    if (file.fieldName !== options.name) return;
    const extension = CONTENT_TYPES[file.type];
    if (!extension) return;
    const key = storageKeyGenerator(options.entityType, options.entityId, options.fileName, extension);

    return uploadToStorage(file, key);
  };
}

async function uploadToStorage(file: FileUpload, key: string): Promise<File> {
  const chunks: Uint8Array[] = [];
  const reader = file.stream().getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const body = Buffer.concat(chunks);
  const storage = StorageService.create();
  await storage.upload(key, body, file.type);

  return new File([], key, { type: file.type });
}

function generateStorageKey(entityType: string, entityId: string, fileName: string, extension: string): string {
  const hash = randomUUID().slice(0, 8);
  return `${entityType}/${entityId}/${fileName}-${hash}.${extension}`;
}
