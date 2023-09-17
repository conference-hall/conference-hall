import { db } from '~/libs/db.ts';

type TalksListOptions = { archived?: boolean };

export async function listTalks(userId: string, options?: TalksListOptions) {
  const talks = await db.talk.findMany({
    select: {
      id: true,
      title: true,
      archived: true,
      createdAt: true,
      speakers: true,
    },
    where: {
      speakers: { some: { id: userId } },
      archived: Boolean(options?.archived),
    },
    orderBy: { updatedAt: 'desc' },
  });

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    archived: talk.archived,
    createdAt: talk.createdAt.toUTCString(),
    speakers: talk.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      picture: speaker.picture,
    })),
  }));
}
