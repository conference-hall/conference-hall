import { describe, expect, it, vi } from 'vitest';
import { resolveStorageUrl } from './storage-utils.ts';

vi.mock('../../../servers/environment.server.ts', () => ({
  getSharedServerEnv: () => ({ APP_URL: 'http://127.0.0.1:3000' }),
}));

describe('resolveStorageUrl', () => {
  it('returns null for null input', () => {
    expect(resolveStorageUrl(null)).toBeNull();
  });

  it('returns data URIs as-is', () => {
    const dataUri = 'data:image/svg+xml;base64,PHN2Zz4=';
    expect(resolveStorageUrl(dataUri)).toBe(dataUri);
  });

  it('resolves bucket keys to proxy URLs', () => {
    expect(resolveStorageUrl('events/abc123/logo-a1b2c3d4.webp')).toBe(
      'http://127.0.0.1:3000/storage/events/abc123/logo-a1b2c3d4.webp',
    );
  });
});
