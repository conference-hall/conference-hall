import { describe, expect, it, vi } from 'vitest';

const mockUpload = vi.fn().mockResolvedValue('events/abc/logo-12345678.webp');

vi.mock('~/shared/storage/storage.server.ts', () => ({
  StorageService: { create: () => ({ upload: mockUpload }) },
}));

vi.mock('~/shared/storage/storage-key.server.ts', () => ({
  generateStorageKey: (_entityType: string, _entityId: string, _fileName: string, ext: string) =>
    `events/abc/logo-12345678.${ext}`,
}));

import { uploadToStorageHandler } from './storage.server.ts';

function createFakeFileUpload(fieldName: string, type: string, data: Uint8Array) {
  return {
    fieldName,
    type,
    name: 'test.webp',
    stream: () =>
      new ReadableStream({
        start: (ctrl) => {
          ctrl.enqueue(data);
          ctrl.close();
        },
      }),
  };
}

describe('uploadToStorageHandler', () => {
  const options = { name: 'logo', entityType: 'events', entityId: 'abc', fileName: 'logo' };

  it('returns undefined for non-matching field names', async () => {
    const handler = uploadToStorageHandler(options);
    const file = createFakeFileUpload('avatar', 'image/webp', new Uint8Array([1, 2, 3]));

    const result = await handler(file as never);

    expect(result).toBeUndefined();
  });

  it('returns undefined for unsupported content types', async () => {
    const handler = uploadToStorageHandler(options);
    const file = createFakeFileUpload('logo', 'image/gif', new Uint8Array([1, 2, 3]));

    const result = await handler(file as never);

    expect(result).toBeUndefined();
  });

  it('uploads the file and returns a File with the bucket key as name', async () => {
    const handler = uploadToStorageHandler(options);
    const data = new Uint8Array([1, 2, 3]);
    const file = createFakeFileUpload('logo', 'image/webp', data);

    const result = await handler(file as never);

    expect(result).toBeInstanceOf(File);
    expect((result as File).name).toBe('events/abc/logo-12345678.webp');
    expect((result as File).type).toBe('image/webp');
    expect(mockUpload).toHaveBeenCalledWith('events/abc/logo-12345678.webp', expect.any(Buffer), 'image/webp');
  });

  it.each([
    ['image/avif', 'avif'],
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
  ])('supports %s content type', async (contentType, expectedExt) => {
    const handler = uploadToStorageHandler(options);
    const file = createFakeFileUpload('logo', contentType, new Uint8Array([1]));

    const result = await handler(file as never);

    expect(result).toBeInstanceOf(File);
    expect((result as File).name).toBe(`events/abc/logo-12345678.${expectedExt}`);
  });
});
