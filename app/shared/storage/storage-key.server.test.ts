import { describe, expect, it, vi } from 'vitest';
import { generateStorageKey, resolveStorageUrl } from './storage-key.server.ts';

vi.mock('../../../servers/environment.server.ts', () => ({
  getSharedServerEnv: () => ({ APP_URL: 'http://127.0.0.1:3000' }),
}));

describe('generateStorageKey', () => {
  it('generates a key with entity-scoped folder structure', () => {
    const key = generateStorageKey('events', 'abc123', 'logo', 'webp');
    expect(key).toMatch(/^events\/abc123\/logo-[a-f0-9]{8}\.webp$/);
  });

  it('generates unique keys on each call', () => {
    const key1 = generateStorageKey('events', 'abc123', 'logo', 'webp');
    const key2 = generateStorageKey('events', 'abc123', 'logo', 'webp');
    expect(key1).not.toBe(key2);
  });
});

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
