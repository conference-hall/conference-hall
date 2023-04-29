import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';

export async function listTalksToSubmit(userId: string, slug: string) {
  const event = await db.event.findUnique({ select: { id: true }, where: { slug } });
  if (!event) throw new EventNotFoundError();

  const proposalsCount = await db.proposal.count({
    where: { eventId: event.id, speakers: { some: { id: userId } }, status: { not: { equals: 'DRAFT' } } },
  });

  const drafts = await db.proposal.findMany({
    include: { speakers: true },
    where: { eventId: event.id, speakers: { some: { id: userId } }, status: 'DRAFT' },
    orderBy: { createdAt: 'desc' },
  });

  const talks = await db.talk.findMany({
    include: { speakers: true },
    where: {
      speakers: { some: { id: userId } },
      proposals: { none: { eventId: event.id } },
      archived: false,
    },
    orderBy: { title: 'asc' },
  });

  return {
    proposalsCount,
    drafts: drafts.map((draft) => ({
      id: draft.talkId!,
      title: draft.title,
      speakers: draft.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
      })),
    })),
    talks: talks.map((talk) => ({
      id: talk.id,
      title: talk.title,
      speakers: talk.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
      })),
    })),
  };
}
