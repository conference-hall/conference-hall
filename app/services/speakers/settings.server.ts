import { z } from 'zod';
import { db } from '../../services/db';
import { UserNotFoundError } from '../errors';

export type UserSettings = {
  name: string | null;
  email: string | null;
  photoURL: string | null;
  bio: string | null;
  references: string | null;
  company: string | null;
  address: string | null;
  twitter: string | null;
  github: string | null;
};

/**
 * Get a user settings
 * @param userId Id of the user
 * @returns UserSettings
 */
export async function getSettings(userId: string): Promise<UserSettings> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();
  return {
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    bio: user.bio,
    references: user.references,
    company: user.company,
    address: user.address,
    twitter: user.twitter,
    github: user.github,
  };
}

/**
 * Update a user settings
 * @param userId Id of the user
 * @param data Settings data
 */
export async function updateSettings(userId: string, data: SettingsUpdateData) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();

  await db.user.update({ where: { id: userId }, data });
}

const UserPersonalInfo = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  photoURL: z.string().url().min(1),
});

const UserDetails = z.object({
  bio: z.string().nullable(),
  references: z.string().nullable(),
});

const UserAdditionalInfo = z.object({
  company: z.string(),
  address: z.string(),
  twitter: z.string(),
  github: z.string(),
});

type SettingsSchema = typeof UserPersonalInfo | typeof UserDetails | typeof UserAdditionalInfo;
type SettingsUpdateData = z.infer<SettingsSchema>;

export function validateProfileData(form: FormData, type?: string) {
  let schema: SettingsSchema = UserPersonalInfo;
  if (type === 'DETAILS') schema = UserDetails;
  if (type === 'ADDITIONAL') schema = UserAdditionalInfo;

  return schema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    photoURL: form.get('photoURL'),
    bio: form.get('bio'),
    references: form.get('references'),
    company: form.get('company'),
    address: form.get('address'),
    twitter: form.get('twitter'),
    github: form.get('github'),
  });
}
