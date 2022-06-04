import { db } from '../../services/db';
import { SpeakerNotFoundError } from '../errors';

export type SpeakerActivity = {
  profile: {
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
  activities: Array<{
    id: string;
    title: string;
    date: string;
    speakers: string[];
    proposals: Array<{ eventSlug: string; eventName: string; date: string; status: string }>;
  }>;
};

/**
 * Get a speaker activity
 * @param speakerId Id of the speaker
 * @returns SpeakerActivity
 */
export async function getSpeakerActivity(speakerId: string): Promise<SpeakerActivity> {
  const speaker = await db.user.findUnique({ where: { id: speakerId } });
  if (!speaker) throw new SpeakerNotFoundError();

  const talksActivity = await db.talk.findMany({
    where: { archived: false, speakers: { some: { id: speakerId } } },
    include: {
      speakers: { select: { name: true } },
      proposals: {
        select: { title: true, status: true, updatedAt: true, event: { select: { slug: true, name: true } } },
        orderBy: { updatedAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return {
    profile: {
      name: speaker.name,
      email: speaker.email,
      photoURL: speaker.photoURL,
      bio: speaker.bio,
      references: speaker.references,
      company: speaker.company,
      address: speaker.address,
      twitter: speaker.twitter,
      github: speaker.github,
    },
    activities: talksActivity.map((talk) => ({
      id: talk.id,
      title: talk.title,
      date: talk.updatedAt.toISOString(),
      speakers: talk.speakers.map((speaker) => speaker.name || ''),
      proposals: talk.proposals.map((proposal) => ({
        eventName: proposal.event.name,
        eventSlug: proposal.event.slug,
        date: proposal.updatedAt.toISOString(),
        status: proposal.status,
      })),
    })),
  };
}

