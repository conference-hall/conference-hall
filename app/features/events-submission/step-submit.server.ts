import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';
import { requireUserSession } from '../auth/auth.server';

export type SubmitForm = {
  title: string;
  speakers: Array<{ name: string | null; photoURL: string | null }>;
  formats: string[];
  categories: string[];
  codeOfConductUrl: string | null;
};

export const loadProposal: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { talkId, eventSlug } = params;
  if (!talkId) throw new Response('Talk id is required', { status: 400 });

  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true, codeOfConductUrl: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found.', { status: 404 });

  const proposal = await db.proposal.findUnique({
    select: { title: true, speakers: true, formats: true, categories: true },
    where: { talkId_eventId: { talkId, eventId: event.id } },
  });
  if (!proposal) throw new Response('Proposal not found.', { status: 404 });

  if (!proposal.speakers.some((s) => s.id === uid)) {
    throw new Response('Not your proposal!', { status: 403 });
  }

  return json<SubmitForm>({
    title: proposal.title,
    speakers: proposal.speakers.map((s) => ({ name: s.name, photoURL: s.photoURL })),
    formats: proposal.formats.map((f) => f.name),
    categories: proposal.categories.map((c) => c.name),
    codeOfConductUrl: event.codeOfConductUrl,
  });
};

export const submitProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { talkId, eventSlug } = params;
  if (!talkId) throw new Response('Talk id is required', { status: 400 });

  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true, maxProposals: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found.', { status: 404 });

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new Response('CFP is not opened!', { status: 403 });

  if (event.maxProposals) {
    const nbProposals = await db.proposal.count({
      where: {
        eventId: event.id,
        speakers: { some: { id: uid } },
        status: { not: { equals: 'DRAFT' } },
        id: { not: { equals: talkId } },
      },
    });
    if (nbProposals >= event.maxProposals) {
      throw new Response('You have reached the maximum number of proposals.', { status: 403 });
    }
  }

  const proposal = await db.proposal.findFirst({
    where: { talkId, eventId: event.id, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new Response('Not your proposal!', { status: 403 });

  await db.proposal.update({
    data: { status: 'SUBMITTED' },
    where: { talkId_eventId: { talkId, eventId: event.id } },
  });

  // TODO Email notification to speakers
  // TODO Email notification to organizers
  // TODO Slack notification

  return redirect(`/${eventSlug}/submission`);
};
