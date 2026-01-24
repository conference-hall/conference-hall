/**
 * Migration script: Firebase Auth → Better-Auth
 *
 * Reads a Firebase Auth export (JSON) and creates Better-Auth Account records
 * for existing PostgreSQL users. Also updates emailVerified from Firebase data.
 *
 * Usage:
 *   tsx scripts/migrate-firebase-to-better-auth.ts <firebase-users.json>
 *
 * The script is idempotent — safe to re-run.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { logger } from '../app/shared/logger/logger.server.ts';
import { db } from '../prisma/db.server.ts';

// --- Firebase export types ---

interface FirebaseProviderInfo {
  providerId: string;
  rawId: string;
  email?: string;
}

interface FirebaseUser {
  localId: string;
  email?: string;
  emailVerified?: boolean;
  passwordHash?: string;
  salt?: string;
  providerUserInfo?: FirebaseProviderInfo[];
}

interface FirebaseExport {
  users: FirebaseUser[];
}

// --- Provider mapping ---

const PROVIDER_MAP: Record<string, string> = {
  'google.com': 'google',
  'github.com': 'github',
  'twitter.com': 'twitter',
};

// --- Stats tracking ---

interface MigrationStats {
  totalUsers: number;
  matched: number;
  unmatched: number;
  accountsCreated: Record<string, number>;
  emailVerifiedUpdated: number;
  skippedExisting: number;
  errors: number;
}

function createStats(): MigrationStats {
  return {
    totalUsers: 0,
    matched: 0,
    unmatched: 0,
    accountsCreated: {},
    emailVerifiedUpdated: 0,
    skippedExisting: 0,
    errors: 0,
  };
}

// --- Main ---

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx scripts/migrate-firebase-to-better-auth.ts <firebase-users.json>');
    process.exit(1);
  }

  const absolutePath = resolve(filePath);
  logger.info('Starting Firebase → Better-Auth migration', { file: absolutePath });

  // Parse Firebase export and build lookup maps
  const firebaseExport: FirebaseExport = JSON.parse(readFileSync(absolutePath, 'utf-8'));
  const firebaseByEmail = new Map<string, FirebaseUser>();
  const firebaseByLocalId = new Map<string, FirebaseUser>();

  for (const fbUser of firebaseExport.users) {
    if (fbUser.email) {
      firebaseByEmail.set(fbUser.email.toLowerCase(), fbUser);
    }
    firebaseByLocalId.set(fbUser.localId, fbUser);
  }

  logger.info(`Parsed ${firebaseExport.users.length} Firebase users`);

  // Load PostgreSQL users with a Firebase UID
  const pgUsers = await db.user.findMany({
    where: { uid: { not: null }, deletedAt: null },
    select: { id: true, uid: true, email: true, emailVerified: true },
  });

  const stats = createStats();
  stats.totalUsers = pgUsers.length;

  logger.info(`Found ${pgUsers.length} active PostgreSQL users with Firebase UID`);

  // Match and migrate each user
  for (const pgUser of pgUsers) {
    try {
      const fbUser = firebaseByLocalId.get(pgUser.uid!) ?? firebaseByEmail.get(pgUser.email.toLowerCase());

      if (!fbUser) {
        stats.unmatched++;
        logger.warn('No Firebase match found', { userId: pgUser.id, email: pgUser.email, uid: pgUser.uid });
        continue;
      }

      stats.matched++;
      logger.info(`#${stats.matched}: Migrate ${pgUser.id} - ${pgUser.email} - ${pgUser.uid}`);

      // Create social provider accounts
      for (const provider of fbUser.providerUserInfo ?? []) {
        const betterAuthProvider = PROVIDER_MAP[provider.providerId];
        if (!betterAuthProvider) continue;

        const created = await createAccountIfNotExists({
          accountId: provider.rawId,
          providerId: betterAuthProvider,
          userId: pgUser.id,
        });
        if (created) {
          stats.accountsCreated[betterAuthProvider] = (stats.accountsCreated[betterAuthProvider] ?? 0) + 1;
        } else {
          stats.skippedExisting++;
        }
      }

      // Create credential account if the user has a password
      if (fbUser.passwordHash && fbUser.salt) {
        const firebaseScryptHash = `firebase-scrypt:${fbUser.passwordHash}:${fbUser.salt}`;
        const created = await createAccountIfNotExists({
          accountId: pgUser.id,
          providerId: 'credential',
          userId: pgUser.id,
          password: firebaseScryptHash,
        });
        if (created) {
          stats.accountsCreated['credential'] = (stats.accountsCreated['credential'] ?? 0) + 1;
        } else {
          stats.skippedExisting++;
        }
      }

      // Always update emailVerified to true for existing pg users
      await db.user.update({ where: { id: pgUser.id }, data: { emailVerified: true } });
      stats.emailVerifiedUpdated++;
    } catch (error) {
      stats.errors++;
      logger.error('Error migrating user', { userId: pgUser.id, error });
    }
  }

  logger.info('Migration completed', {
    totalUsers: stats.totalUsers,
    matched: stats.matched,
    unmatched: stats.unmatched,
    accountsCreated: stats.accountsCreated,
    emailVerifiedUpdated: stats.emailVerifiedUpdated,
    skippedExisting: stats.skippedExisting,
    errors: stats.errors,
  });

  await db.$disconnect();
}

async function createAccountIfNotExists(data: {
  accountId: string;
  providerId: string;
  userId: string;
  password?: string;
}): Promise<boolean> {
  const existing = await db.account.findFirst({
    where: {
      userId: data.userId,
      providerId: data.providerId,
      accountId: data.accountId,
    },
  });

  if (existing) return false;

  // todo(auth): is the `scope` must be stored for social providers?
  await db.account.create({
    data: {
      accountId: data.accountId,
      providerId: data.providerId,
      userId: data.userId,
      password: data.password ?? null,
    },
  });

  return true;
}

main().catch((error) => {
  logger.error('Migration failed', { error });
  process.exit(1);
});
