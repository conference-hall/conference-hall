import { Prisma } from '@prisma/client';

import { db } from 'prisma/db.server';

const EVENTS_BY_PAGE = 3;

export class SpeakerActivities {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new SpeakerActivities(userId);
  }

  async list(page: number = 1) {
    const eventSubmittedIds = await lastEventsSubmitted(this.userId);

    const totalEvents = eventSubmittedIds.length;
    const takeEvents = Math.min(page * EVENTS_BY_PAGE, totalEvents);
    const eventIds = eventSubmittedIds.slice(0, takeEvents);

    const events = await db.event.findMany({
      where: { id: { in: eventIds } },
      include: {
        proposals: {
          where: { speakers: { some: { id: this.userId } } },
          include: { speakers: true },
        },
      },
    });

    return {
      activities: eventIds.map((id) => {
        const event = events.find((e) => e.id === id)!;

        return {
          slug: event.slug,
          name: event.name,
          logo: event.logo,
          cfpState: event.cfpState,
          submissions: event.proposals.map((proposal) => ({
            id: proposal.id,
            title: proposal.title,
            updatedAt: proposal.updatedAt.toUTCString(),
            status: proposal.getStatusForSpeaker(event.isCfpOpen),
            speakers: proposal.speakers.map((speaker) => ({
              id: speaker.id,
              name: speaker.name,
              picture: speaker.picture,
            })),
          })),
        };
      }),
      hasNextPage: takeEvents < totalEvents,
      nextPage: page + 1,
    };
  }
}

async function lastEventsSubmitted(speakerId: string) {
  const results = await db.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT DISTINCT(events.id), MAX(proposals."updatedAt") AS lastUpdate
      FROM events
      JOIN proposals ON proposals."eventId" = events.id
      JOIN _speakers_proposals ON _speakers_proposals."A" = proposals.id AND _speakers_proposals."B" = ${speakerId}
      GROUP BY 1
      ORDER BY lastUpdate DESC
    `,
  );
  return results.map(({ id }) => id);
}
