import { db } from '../../../../../prisma/db.server.ts';
import type { Event } from '../../../../../prisma/generated/client.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';

// Drops the speakers filter when speakers are hidden or unknown, so every consumer searches the same proposals
export async function resolveSpeakerFilter(
  event: Pick<Event, 'id' | 'displayProposalsSpeakers'>,
  filters: ProposalsFilters,
) {
  if (!filters.speakers) return { filters, speaker: null };

  const speaker = event.displayProposalsSpeakers
    ? await db.eventSpeaker.findFirst({
        where: { id: filters.speakers, eventId: event.id },
        select: { name: true },
      })
    : null;

  if (!speaker) {
    const { speakers: _, ...otherFilters } = filters;
    return { filters: otherFilters, speaker: null };
  }

  return { filters, speaker };
}
