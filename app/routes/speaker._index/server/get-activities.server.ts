import { Prisma } from '@prisma/client';
import { db } from '~/libs/db';
import { SpeakerNotFoundError } from '~/libs/errors';
import { getSpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';
import { getCfpState } from '~/utils/event';

const EVENTS_BY_PAGE = 3;

export async function getActivities(speakerId: string, page: number = 1) {
  const speaker = await db.user.findUnique({ where: { id: speakerId } });

  if (!speaker) throw new SpeakerNotFoundError();

  const eventSubmittedIds = await lastEventsSubmitted(speakerId);

  const totalEvents = eventSubmittedIds.length;
  const takeEvents = Math.min(page * EVENTS_BY_PAGE, totalEvents);
  const eventIds = eventSubmittedIds.slice(0, takeEvents);

  const events = await db.event.findMany({
    where: { id: { in: eventIds } },
    include: {
      proposals: {
        where: { speakers: { some: { id: speakerId } } },
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
        bannerUrl: event.bannerUrl,
        cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
        submissions: event.proposals.map((proposal) => ({
          id: proposal.id,
          title: proposal.title,
          updatedAt: proposal.updatedAt.toUTCString(),
          status: getSpeakerProposalStatus(proposal, event),
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

async function lastEventsSubmitted(speakerId: string) {
  const results = await db.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT DISTINCT(events.id), MAX(proposals."updatedAt") AS lastUpdate
      FROM events
      JOIN proposals ON proposals."eventId" = events.id
      JOIN _speakers_proposals ON _speakers_proposals."A" = proposals.id AND _speakers_proposals."B" = ${speakerId}
      GROUP BY 1
      ORDER BY lastUpdate DESC
    `
  );
  return results.map(({ id }) => id);
}
