import { db } from '../services/db';

export type SpeakerActivity = {
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
 * Get a speaker activity
 * @param speakerId Id of the speaker
 * @returns SpeakerActivity
 */
export async function getSpeakerActivity(speakerId: string): Promise<SpeakerActivity> {
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

export class SpeakerNotFoundError extends Error {
  constructor() {
    super('Speaker not found');
    this.name = 'SpeakerNotFoundError';
  }
}
