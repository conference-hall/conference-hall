import { hashPassword } from 'better-auth/crypto';
import { FirebaseScrypt } from 'firebase-scrypt';
import { db } from '../../../prisma/db.server.ts';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import { logger } from '../logger/logger.server.ts';

const FIREBASE_SCRYPT_PREFIX = 'firebase-scrypt:';

export function isFirebasePasswordHash(hash: string) {
  return hash.startsWith(FIREBASE_SCRYPT_PREFIX);
}

export async function verifyFirebaseScryptPassword(hash: string, password: string): Promise<boolean> {
  const { signerKey, saltSeparator, rounds, memCost } = getFirebaseScryptParams();
  const scrypt = new FirebaseScrypt({ signerKey, saltSeparator, rounds, memCost });

  // Format: firebase-scrypt:<base64_passwordHash>:<base64_salt>
  const payload = hash.slice(FIREBASE_SCRYPT_PREFIX.length);
  const separatorIndex = payload.lastIndexOf(':');
  if (separatorIndex === -1) {
    logger.warn('Invalid firebase-scrypt hash format: missing salt separator');
    return false;
  }
  const passwordHash = payload.slice(0, separatorIndex);
  const salt = payload.slice(separatorIndex + 1);

  const isValid = await scrypt.verify(password, salt, passwordHash);
  if (!isValid) return false;

  // Re-hash with better-auth's native hash for future logins
  const newHash = await hashPassword(password);
  await db.account.updateMany({
    where: { password: hash, providerId: 'credential' },
    data: { password: newHash },
  });
  logger.info('Migrated firebase-scrypt password to native hash');

  return true;
}

function getFirebaseScryptParams(): { signerKey: string; saltSeparator: string; rounds: number; memCost: number } {
  const env = getWebServerEnv();
  const signerKey = env.FIREBASE_SCRYPT_SIGNER_KEY;
  const saltSeparator = env.FIREBASE_SCRYPT_SALT_SEPARATOR;
  const rounds = env.FIREBASE_SCRYPT_ROUNDS;
  const memCost = env.FIREBASE_SCRYPT_MEM_COST;

  if (!signerKey || !saltSeparator || !rounds || !memCost) {
    throw new Error('Missing FIREBASE_SCRYPT_* environment variables required for legacy password verification');
  }

  return { signerKey, saltSeparator, rounds, memCost };
}
