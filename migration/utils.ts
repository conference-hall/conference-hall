import { TalkLevel } from '@prisma/client';
import { db } from 'prisma/db.server';

import languages from '../app/libs/formatters/languages.json';

export type LanguageValues = Array<{ value: string; label: string }>;

export const LANGUAGES: LanguageValues = Object.entries(languages).map(([id, label]) => ({
  value: id,
  label,
}));

export function logRecord(name: string, index: number, total: number, id: string) {
  console.log(`  ${name} [${index}/${total}] ${id}`);
}

export function mapBoolean(bool?: string | null) {
  if (!bool) return false;
  if (bool === 'false') return false;
  if (bool === 'true') return true;
  return Boolean(bool);
}

export function arrayFromBooleanMap(map?: Record<string, boolean> | null) {
  if (!map) return [];
  return Object.entries(map)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);
}

export function mapLevel(level?: string | null) {
  switch (level) {
    case 'beginner':
      return TalkLevel.BEGINNER;
    case 'intermediate':
      return TalkLevel.INTERMEDIATE;
    case 'advanced':
      return TalkLevel.ADVANCED;
    default:
      return undefined;
  }
}

export function mapLanguage(language?: string | null) {
  if (!language) return undefined;

  const codes = LANGUAGES.filter(({ label }) => label.toLowerCase() === language.toLocaleLowerCase()).map(
    ({ value }) => value,
  );

  if (codes.length === 0) return undefined;

  return codes;
}

export async function findUser(migrationId: string, memoizedUsers: Map<string, string>) {
  if (memoizedUsers.has(migrationId)) return memoizedUsers.get(migrationId) as string;

  const user = await db.user.findFirst({ where: { migrationId } });
  if (!user) return undefined;

  memoizedUsers.set(migrationId, user.id);
  return user.id;
}

export async function findUsers(migrationIds: string[], memoizedUsers: Map<string, string>) {
  const users = await Promise.all(migrationIds.map((migrationId) => findUser(migrationId, memoizedUsers)));
  return users.filter(Boolean);
}
