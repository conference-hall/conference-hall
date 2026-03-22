import type { Readable } from 'node:stream';
import { NoSuchKey } from '@aws-sdk/client-s3';
import { afterEach, describe, expect, it } from 'vitest';
import { StorageService } from './storage.server.ts';

async function streamToString(readable: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

describe('StorageService', () => {
  afterEach(async () => {
    await StorageService.clearBucket();
  });

  describe('#upload', () => {
    it('uploads a file and returns the key', async () => {
      const storage = StorageService.create();

      const result = await storage.upload('events/abc/logo.webp', Buffer.from('image-data'), 'image/webp');

      expect(result).toBe('events/abc/logo.webp');

      const object = await storage.getObject('events/abc/logo.webp');
      expect(object.contentType).toBe('image/webp');
      expect(await streamToString(object.body)).toBe('image-data');
    });
  });

  describe('#getObject', () => {
    it('retrieves an uploaded file with correct body, contentType, and contentLength', async () => {
      const storage = StorageService.create();
      const content = 'hello-world';
      await storage.upload('test/file.txt', Buffer.from(content), 'text/plain');

      const result = await storage.getObject('test/file.txt');

      expect(await streamToString(result.body)).toBe(content);
      expect(result.contentType).toBe('text/plain');
      expect(result.contentLength).toBe(Buffer.byteLength(content));
    });

    it('throws NoSuchKey when the key does not exist', async () => {
      const storage = StorageService.create();

      await expect(storage.getObject('nonexistent/key.txt')).rejects.toThrow(NoSuchKey);
    });
  });

  describe('#delete', () => {
    it('deletes an uploaded file', async () => {
      const storage = StorageService.create();
      await storage.upload('test/delete-me.txt', Buffer.from('data'), 'text/plain');

      await storage.delete('test/delete-me.txt');

      await expect(storage.getObject('test/delete-me.txt')).rejects.toThrow(NoSuchKey);
    });
  });

  describe('#deleteQuietly', () => {
    it('does not throw when the key does not exist', async () => {
      const storage = StorageService.create();

      await expect(storage.deleteQuietly('nonexistent/key.txt')).resolves.toBeUndefined();
    });

    it('deletes an uploaded file', async () => {
      const storage = StorageService.create();
      await storage.upload('test/quiet-delete.txt', Buffer.from('data'), 'text/plain');

      await storage.deleteQuietly('test/quiet-delete.txt');

      await expect(storage.getObject('test/quiet-delete.txt')).rejects.toThrow(NoSuchKey);
    });
  });

  describe('.clearBucket', () => {
    it('removes all objects from the bucket', async () => {
      const storage = StorageService.create();
      await storage.upload('file1.png', Buffer.from('a'), 'image/png');
      await storage.upload('file2.png', Buffer.from('b'), 'image/png');
      await storage.upload('dir/file3.png', Buffer.from('c'), 'image/png');

      await StorageService.clearBucket();

      await expect(storage.getObject('file1.png')).rejects.toThrow(NoSuchKey);
      await expect(storage.getObject('file2.png')).rejects.toThrow(NoSuchKey);
      await expect(storage.getObject('dir/file3.png')).rejects.toThrow(NoSuchKey);
    });
  });
});
