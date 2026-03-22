/**
 * Migration script: Copy event logos from Firebase Storage to S3.
 *
 * Prerequisites:
 *   - Firebase Admin SDK: set FIREBASE_SERVICE_ACCOUNT env var
 *   - S3 client: set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY env vars
 *   - Database: set DATABASE_URL env var
 *
 * Usage:
 *   npx tsx scripts/migrate-firebase-to-s3.ts
 *
 * Idempotent: only processes events where logo IS NULL.
 */
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { generateStorageKey } from '../app/shared/storage/storage-key.server.ts';
import { StorageService } from '../app/shared/storage/storage.server.ts';
import { db } from '../prisma/db.server.ts';

const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!FIREBASE_SERVICE_ACCOUNT) {
  console.error('FIREBASE_SERVICE_ACCOUNT env var is required');
  process.exit(1);
}

const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = getStorage(app).bucket();
const storage = StorageService.create();

async function migrate() {
  const events = await db.event.findMany({
    where: { logoUrl: { not: null }, logo: null },
    select: { id: true, logoUrl: true },
  });

  console.log(`Found ${events.length} events to migrate`);

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
        console.warn(`[${index + 1}/${events.length}] ${event.id} — could not extract filename from: ${logoUrl}`);
        skipped++;
        continue;
      }

      const extension = extractExtension(filename);
      const file = bucket.file(filename);

      const [exists] = await file.exists();
      if (!exists) {
        console.warn(`[${index + 1}/${events.length}] ${event.id} — file not found in Firebase: ${filename}`);
        skipped++;
        continue;
      }

      const [buffer] = await file.download();
      const [metadata] = await file.getMetadata();
      const contentType = (metadata.contentType as string) || `image/${extension}`;

      const key = generateStorageKey('events', event.id, 'logo', extension);
      await storage.upload(key, buffer, contentType);

      await db.event.update({ where: { id: event.id }, data: { logo: key } });

      console.log(`[${index + 1}/${events.length}] ${event.id} → ${key}`);
      success++;
    } catch (error) {
      console.error(`[${index + 1}/${events.length}] ${event.id} — ERROR:`, error);
      failed++;
    }
  }

  console.log(
    `\nMigration complete: ${success} success, ${failed} failed, ${skipped} skipped (total: ${events.length})`,
  );
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

function extractExtension(filename: string): string {
  const match = filename.match(/\.(\w+)$/);
  return match ? match[1] : 'jpg';
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
