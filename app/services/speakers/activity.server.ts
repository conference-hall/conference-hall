import { db } from '../../services/db';
import { SpeakerNotFoundError } from '../errors';

/**
 * Get a speaker activity
 * @param speakerId Id of the speaker
 * @returns SpeakerActivity
 */
export async function getActivity(speakerId: string) {
  const speaker = await db.user.findUnique({ where: { id: speakerId } });
  if (!speaker) throw new SpeakerNotFoundError();

  const talksActivity = await db.talk.findMany({
    where: { archived: false, speakers: { some: { id: speakerId } } },
    include: {
      speakers: { select: { name: true } },
      proposals: {
        select: {
          title: true,
          status: true,
          updatedAt: true,
          event: { select: { slug: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return talksActivity.map((talk) => ({
    id: talk.id,
    title: talk.title,
    date: talk.updatedAt.toUTCString(),
    speakers: talk.speakers.map((speaker) => speaker.name || ''),
    proposals: talk.proposals.map((proposal) => ({
      eventName: proposal.event.name,
      eventSlug: proposal.event.slug,
      date: proposal.updatedAt.toUTCString(),
      status: proposal.status,
    })),
  }));
}
