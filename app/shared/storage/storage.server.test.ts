import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { describe, expect, it, vi } from 'vitest';

const mockSend = vi.fn();

vi.mock('./s3-client.server.ts', () => ({
  s3Client: { send: (...args: unknown[]) => mockSend(...args) },
}));

vi.mock('../../../servers/environment.server.ts', () => ({
  getWebServerEnv: () => ({ S3_BUCKET: 'test-bucket' }),
}));

import { StorageService } from './storage.server.ts';

describe('StorageService', () => {
  describe('#upload', () => {
    it('sends a PutObjectCommand and returns the key', async () => {
      mockSend.mockResolvedValueOnce({});
      const storage = StorageService.create();

      const result = await storage.upload('events/abc/logo.webp', Buffer.from('data'), 'image/webp');

      expect(result).toBe('events/abc/logo.webp');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Key: 'events/abc/logo.webp',
            Body: Buffer.from('data'),
            ContentType: 'image/webp',
          },
        }),
      );
      expect(mockSend.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
    });
  });

  describe('#getObject', () => {
    it('sends a GetObjectCommand and returns body, contentType, and contentLength', async () => {
      const mockBody = { pipe: vi.fn() };
      mockSend.mockResolvedValueOnce({
        Body: mockBody,
        ContentType: 'image/webp',
        ContentLength: 1024,
      });
      const storage = StorageService.create();

      const result = await storage.getObject('events/abc/logo.webp');

      expect(result.body).toBe(mockBody);
      expect(result.contentType).toBe('image/webp');
      expect(result.contentLength).toBe(1024);
      expect(mockSend.mock.calls[0][0]).toBeInstanceOf(GetObjectCommand);
    });

    it('defaults contentType and contentLength when missing', async () => {
      mockSend.mockResolvedValueOnce({ Body: {} });
      const storage = StorageService.create();

      const result = await storage.getObject('events/abc/logo.webp');

      expect(result.contentType).toBe('application/octet-stream');
      expect(result.contentLength).toBe(0);
    });
  });

  describe('#delete', () => {
    it('sends a DeleteObjectCommand', async () => {
      mockSend.mockResolvedValueOnce({});
      const storage = StorageService.create();

      await storage.delete('events/abc/logo.webp');

      expect(mockSend.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { Bucket: 'test-bucket', Key: 'events/abc/logo.webp' },
        }),
      );
    });
  });

  describe('#deleteQuietly', () => {
    it('does not throw when delete fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('S3 error'));
      const storage = StorageService.create();

      await expect(storage.deleteQuietly('events/abc/logo.webp')).resolves.toBeUndefined();
    });

    it('deletes the object when it exists', async () => {
      mockSend.mockResolvedValueOnce({});
      const storage = StorageService.create();

      await storage.deleteQuietly('events/abc/logo.webp');

      expect(mockSend.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand);
    });
  });
});
