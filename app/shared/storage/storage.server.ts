import type { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import { logger } from '../logger/logger.server.ts';
import { s3Client } from './s3-client.server.ts';

const { S3_BUCKET } = getWebServerEnv();

export class StorageService {
  private bucket: string;

  private constructor(bucket: string) {
    this.bucket = bucket;
  }

  static create(): StorageService {
    return new StorageService(S3_BUCKET);
  }

  static async clearBucket(): Promise<void> {
    let continuationToken: string | undefined;

    do {
      const listResponse = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          ContinuationToken: continuationToken,
        }),
      );

      if (listResponse.Contents?.length) {
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: S3_BUCKET,
            Delete: {
              Objects: listResponse.Contents.map(({ Key }) => ({ Key })),
              Quiet: true,
            },
          }),
        );
      }

      continuationToken = listResponse.IsTruncated ? listResponse.NextContinuationToken : undefined;
    } while (continuationToken);

    logger.info('S3 bucket cleared');
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async getObject(key: string): Promise<{ body: Readable; contentType: string; contentLength?: number }> {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`S3 returned empty body for key: ${key}`);
    }

    return {
      body: response.Body as Readable,
      contentType: response.ContentType ?? 'application/octet-stream',
      contentLength: response.ContentLength,
    };
  }

  async delete(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async deleteQuietly(key: string): Promise<void> {
    try {
      await this.delete(key);
    } catch (error) {
      logger.warn('Failed to delete file from storage', { key, error });
    }
  }
}
