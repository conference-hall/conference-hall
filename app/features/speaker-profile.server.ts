import { z } from 'zod';
import { db } from '../services/db';

export type SpeakerProfile = {
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
 * Get a speaker profile
 * @param speakerId Id of the speaker
 * @returns SpeakerProfile
 */
export async function getProfile(speakerId: string): Promise<SpeakerProfile> {
  const speaker = await db.user.findUnique({ where: { id: speakerId } });
  if (!speaker) throw new SpeakerNotFoundError();
  return {
    name: speaker.name,
    email: speaker.email,
    photoURL: speaker.photoURL,
    bio: speaker.bio,
    references: speaker.references,
    company: speaker.company,
    address: speaker.address,
    twitter: speaker.twitter,
    github: speaker.github,
  };
}

/**
 * Update a speaker profile
 * @param speakerId Id of the speaker
 * @param data Profile data
 */
export async function updateProfile(speakerId: string, data: ProfileUpdateData) {
  const speaker = await db.user.findUnique({ where: { id: speakerId } });
  if (!speaker) throw new SpeakerNotFoundError();

  await db.user.update({ where: { id: speakerId }, data });
}

const SpeakerPersonalInfo = z.object({
  name: z.string().nonempty(),
  email: z.string().email().nonempty(),
  photoURL: z.string().url().nonempty(),
});

const SpeakerDetails = z.object({
  bio: z.string(),
  references: z.string(),
});

const SpeakerAdditionalInfo = z.object({
  company: z.string(),
  address: z.string(),
  twitter: z.string(),
  github: z.string(),
});

type ProfileSchema = typeof SpeakerPersonalInfo | typeof SpeakerDetails | typeof SpeakerAdditionalInfo;
type ProfileUpdateData = z.infer<ProfileSchema>;

export function validateProfileData(form: FormData, type: string) {
  let schema: ProfileSchema = SpeakerPersonalInfo;
  if (type === 'DETAILS') schema = SpeakerDetails;
  if (type === 'ADDITIONAL') schema = SpeakerAdditionalInfo;

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

export class SpeakerNotFoundError extends Error {
  constructor() {
    super('Speaker not found');
    this.name = 'SpeakerNotFoundError';
  }
}
