import { db, Prisma } from '@conference-hall/database';

const EVENTS_BY_PAGE = 8;

export class SpeakerActivities {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new SpeakerActivities(userId);
  }

  async list(page = 1, pageSize = EVENTS_BY_PAGE) {
    const eventSubmittedIds = await lastEventsSubmitted(this.userId);

    const totalEvents = eventSubmittedIds.length;
    const takeEvents = Math.min(page * pageSize, totalEvents);
    const eventIds = eventSubmittedIds.slice(0, takeEvents);

    const events = await db.event.findMany({
      where: { id: { in: eventIds } },
      include: {
        team: true,
        proposals: {
          where: { speakers: { some: { userId: this.userId } } },
          include: { speakers: true, talk: true },
        },
      },
    });

    return {
      activities: eventIds.map((id) => {
        const event = events.find((e) => e.id === id)!;

        return {
          slug: event.slug,
          name: event.name,
          teamName: event.team.name,
          logoUrl: event.logoUrl,
          cfpState: event.cfpState,
          submissions: event.proposals
            .filter((proposal) => proposal.talk && !proposal.talk.archived)
            .map((proposal) => ({
              id: proposal.id,
              title: proposal.title,
              status: proposal.getStatusForSpeaker(event.isCfpOpen),
              speakers: proposal.speakers.map((speaker) => ({
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

async function lastEventsSubmitted(userId: string) {
  const results = await db.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT DISTINCT(events.id), MAX(proposals."updatedAt") AS lastUpdate
      FROM events
      JOIN event_speakers ON event_speakers."userId" = ${userId} and event_speakers."eventId" = events.id
      JOIN _proposals_speakers ON _proposals_speakers."A" = event_speakers.id
      JOIN proposals ON proposals."id" = _proposals_speakers."B"
      GROUP BY 1
      ORDER BY lastUpdate DESC
    `,
  );
  return results.map(({ id }) => id);
}
