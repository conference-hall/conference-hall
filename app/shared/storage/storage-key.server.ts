import { randomUUID } from 'node:crypto';
import { getSharedServerEnv } from '../../../servers/environment.server.ts';

const { APP_URL } = getSharedServerEnv();

export function generateStorageKey(entityType: string, entityId: string, fileName: string, extension: string): string {
  const hash = randomUUID().slice(0, 8);
  return `${entityType}/${entityId}/${fileName}-${hash}.${extension}`;
}

export function resolveStorageUrl(keyOrUrl: string | null): string | null {
  if (!keyOrUrl) return null;
  if (keyOrUrl.startsWith('http') || keyOrUrl.startsWith('data:')) return keyOrUrl;
  return `${APP_URL}/storage/${keyOrUrl}`;
}
