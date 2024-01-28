import { TalkLevel, TeamRole } from '@prisma/client';
import { db } from 'prisma/db.server';
import { z } from 'zod';

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

export function mapInteger(int?: string | null) {
  if (!int) return undefined;
  const parsed = parseInt(int, 10);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

export function checkUrl(url?: string | null) {
  const urlSchema = z.string().url().optional();
  const result = urlSchema.safeParse(url);
  if (!result.success) return undefined;
  return result.data;
}

export function checkEmail(email?: string | null) {
  const emailSchema = z.string().email().optional();
  const result = emailSchema.safeParse(email);
  if (!result.success) return undefined;
  return result.data;
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

export function mapRole(role?: string | null) {
  if (!role) return undefined;

  switch (role) {
    case 'owner':
      return TeamRole.OWNER;
    case 'member':
      return TeamRole.MEMBER;
    case 'reviewer':
      return TeamRole.REVIEWER;
    default:
      return undefined;
  }
}

export function mapEventType(type?: string | null) {
  if (!type) return undefined;

  switch (type) {
    case 'meetup':
      return 'MEETUP';
    case 'conference':
      return 'CONFERENCE';
    default:
      return undefined;
  }
}

export function mapEventVisibility(visibility?: string | null) {
  if (!visibility) return undefined;

  switch (visibility) {
    case 'public':
      return 'PUBLIC';
    case 'private':
      return 'PRIVATE';
    default:
      return undefined;
  }
}

export function mapSurveyQuestions(survey?: any) {
  if (!survey) return undefined;
  const questions = ['gender', 'tshirt', 'diet', 'accomodation', 'transports', 'info'];
  return arrayFromBooleanMap(survey).filter((key) => questions.includes(key));
}

export function mapEmailNotifications(notifications?: any) {
  if (!notifications) return undefined;
  const notifs = ['submitted', 'confirmed', 'declined'];
  return arrayFromBooleanMap(notifications).filter((key) => notifs.includes(key));
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
