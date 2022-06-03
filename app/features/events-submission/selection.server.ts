import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUserSession } from '../auth.server';
import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export type SelectionStep = {
  maxProposals: number | null;
  submittedProposals: number;
  talks: Array<{
    id: string;
    title: string;
    isDraft: boolean;
    speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
  }>;
};

export const loadSelection: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const event = await db.event.findUnique({
    select: { id: true, maxProposals: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found.', { status: 404 });

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new Response('CFP is not opened!', { status: 403 });

  const submittedProposals = await db.proposal.count({
    where: {
      eventId: event.id,
      speakers: { some: { id: uid } },
      status: { not: { equals: 'DRAFT' } },
    },
  });

  const talks = await db.talk.findMany({
    select: {
      id: true,
      title: true,
      speakers: true,
      proposals: {
        select: { id: true },
        where: { eventId: event.id, status: 'DRAFT' },
      },
    },
    where: {
      speakers: { some: { id: uid } },
      archived: false,
      OR: [
        { proposals: { none: { eventId: event.id } } },
        { proposals: { some: { eventId: event.id, status: 'DRAFT' } } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return json<SelectionStep>({
    maxProposals: event.maxProposals,
    submittedProposals,
    talks: talks.map((talk) => ({
      id: talk.id,
      title: talk.title,
      isDraft: talk.proposals.length > 0,
      speakers: talk.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
    })),
  });
};
