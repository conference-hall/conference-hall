import { getSharedServerEnv } from '../../../servers/environment.server.ts';

const { APP_URL } = getSharedServerEnv();

export function resolveStorageUrl(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith('data:')) return key;
  return `${APP_URL}/storage/${key}`;
}
