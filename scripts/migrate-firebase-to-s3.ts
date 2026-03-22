/**
 * Migration script: Copy event logos from Firebase Storage to S3.
 *
 * Prerequisites:
 *   - Database: set DATABASE_URL
 *   - S3 client: set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 *   - Firebase: set FIREBASE_SERVICE_ACCOUNT + FIREBASE_STORAGE (via shared Firebase module)
 *
 * Usage:
 *   npx tsx scripts/migrate-firebase-to-s3.ts
 *
 * Idempotent: only processes events where logo IS NULL.
 */
import { storage as firebaseStorage } from '../app/shared/authentication/firebase.server.ts';
import { logger } from '../app/shared/logger/logger.server.ts';
import { generateStorageKey } from '../app/shared/storage/storage-key.server.ts';
import { StorageService } from '../app/shared/storage/storage.server.ts';
import { db } from '../prisma/db.server.ts';

const bucket = firebaseStorage.bucket();
const storage = StorageService.create();

async function migrate() {
  const events = await db.event.findMany({
    where: { logoUrl: { not: null }, logo: null },
    select: { id: true, logoUrl: true },
  });

  logger.info(`Found ${events.length} events to migrate`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const [index, event] of events.entries()) {
    const logoUrl = event.logoUrl;
    if (!logoUrl) {
      skipped++;
      continue;
    }

    try {
      const filename = extractFilename(logoUrl);
      if (!filename) {
        logger.warn(`[${index + 1}/${events.length}] ${event.id} — could not extract filename from: ${logoUrl}`);
        skipped++;
        continue;
      }

      const file = bucket.file(filename);

      const [exists] = await file.exists();
      if (!exists) {
        logger.warn(`[${index + 1}/${events.length}] ${event.id} — file not found in Firebase: ${filename}`);
        skipped++;
        continue;
      }

      const [buffer] = await file.download();
      const [metadata] = await file.getMetadata();
      const extension = extractExtension(filename, metadata.contentType);
      const contentType = metadata.contentType || `image/${extension}`;

      const key = generateStorageKey('events', event.id, 'logo', extension);
      await storage.upload(key, buffer, contentType);

      await db.event.update({ where: { id: event.id }, data: { logo: key } });

      logger.info(`[${index + 1}/${events.length}] ${event.id} → ${key}`);
      success++;
    } catch (error) {
      logger.error(`[${index + 1}/${events.length}] ${event.id} — migration error`, { error });
      failed++;
    }
  }

  logger.info(`Migration complete: ${success} success, ${failed} failed, ${skipped} skipped (total: ${events.length})`);
}

function extractFilename(logoUrl: string): string | null {
  // Proxy URL: https://conference-hall.io/storage/<filename>
  const proxyMatch = logoUrl.match(/\/storage\/(.+)$/);
  if (proxyMatch) return proxyMatch[1];

  // Firebase public URL: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?...
  const firebaseMatch = logoUrl.match(/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/);
  if (firebaseMatch) return decodeURIComponent(firebaseMatch[1]);

  return null;
}

function extractExtension(filename: string, contentType?: string): string {
  if (contentType) {
    const ctMatch = contentType.match(/^image\/(\w+)/);
    if (ctMatch) return ctMatch[1].toLowerCase();
  }

  const match = filename.match(/\.(\w+)$/);
  if (match) return match[1].toLowerCase();

  logger.warn(`No extension found for "${filename}", defaulting to "jpg"`);
  return 'jpg';
}

migrate()
  .catch((error) => {
    logger.error('Migration failed', { error });
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
