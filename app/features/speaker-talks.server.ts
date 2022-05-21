import { z } from 'zod';
import { db } from '../services/db';
import { jsonToArray } from '../utils/prisma';

export type SpeakerTalks = Array<{
  id: string;
  title: string;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
}>;

/**
 * List all talks for a speaker
 * @param speakerId Id of the speaker
 * @returns SpeakerTalks
 */
export async function findSpeakerTalks(speakerId: string): Promise<SpeakerTalks> {
  const talks = await db.talk.findMany({
    select: { id: true, title: true, createdAt: true, speakers: true },
    where: {
      speakers: { some: { id: speakerId } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    createdAt: talk.createdAt.toISOString(),
    speakers: talk.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
    })),
  }));
}

export interface SpeakerTalk {
  id: string;
  title: string;
  abstract: string;
  level: string | null;
  language: string | null;
  references: string | null;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
  proposals: Array<{ eventSlug: string; eventName: string; status: string; date: string }>;
}

/**
 * Get a talk for a speaker
 * @param speakerId Id of the speaker
 * @param talkId Id of the talk
 * @returns SpeakerTalk
 */
export async function getSpeakerTalk(speakerId: string, talkId?: string): Promise<SpeakerTalk> {
  const talk = await db.talk.findFirst({
    where: {
      speakers: { some: { id: speakerId } },
      id: talkId,
    },
    include: { speakers: true, proposals: { include: { event: true } } },
  });
  if (!talk) throw new TalkNotFoundError();

  const languages = jsonToArray(talk.languages);

  return {
    id: talk.id,
    title: talk.title,
    abstract: talk.abstract,
    level: talk.level,
    language: languages.length > 0 ? languages[0] : null,
    references: talk.references,
    createdAt: talk.createdAt.toISOString(),
    speakers: talk.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
    proposals: talk.proposals.map((proposal) => ({
      eventSlug: proposal.event.slug,
      eventName: proposal.event.name,
      status: proposal.status,
      date: proposal.updatedAt.toISOString(),
    }))
  };
}

/**
 * Delete a talk for a speaker
 * @param speakerId Id of the speaker
 * @param talkId Id of the talk
 */
export async function deleteSpeakerTalk(speakerId: string, talkId?: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: speakerId } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.delete({ where: { id: talkId } });
}

/**
 * Create a new talk for a speaker
 * @param speakerId Id of the speaker
 * @param data Talk data
 */
export async function createSpeakerTalk(speakerId: string, data: TalkUpdateFormData) {
  const result = await db.talk.create({
    data: {
      ...data,
      creator: { connect: { id: speakerId } },
      speakers: { connect: [{ id: speakerId }] },
    },
  });
  return result.id;
}

/**
 * Update a talk for a speaker
 * @param speakerId Id of the speaker
 * @param talkId Id of the talk
 * @param data Talk data
 */
export async function updateSpeakerTalk(speakerId: string, talkId?: string, data?: TalkUpdateFormData) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: speakerId } } },
  });
  if (!talk || !data) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data,
  });
}

type TalkUpdateFormData = z.infer<typeof TalkSchema>;

const TalkSchema = z.object({
  title: z.string().nonempty(),
  abstract: z.string().nonempty(),
  references: z.string().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  languages: z.array(z.string()),
});

export function validateTalkForm(form: FormData) {
  return TalkSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    languages: form.get('language') ? [form.get('language')] : [],
  });
}

export class TalkNotFoundError extends Error {
  constructor() {
    super('Talk not found');
    this.name = 'TalkNotFoundError';
  }
}
