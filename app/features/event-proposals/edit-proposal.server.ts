import { requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';
import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { validate } from '../event-submission/validation/talk-validation';

export type SpeakerEditProposal = {
  proposal: {
    id: string;
    talkId: string;
    title: string;
    abstract: string;
    status: string;
    level: string | null;
    languages: string | null;
    references: string | null;
    createdAt: string;
    formats: string[];
    categories: string[];
    speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
  };
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
};

export const loadSpeakerEditProposal: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: params.id,
    },
    include: { speakers: true, formats: true, categories: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!proposal) throw new Response('Proposal not found', { status: 404 });

  return {
    proposal: {
      id: proposal.id,
      talkId: proposal.talkId,
      title: proposal.title,
      abstract: proposal.abstract,
      status: proposal.status,
      level: proposal.level,
      languages: proposal.languages,
      references: proposal.references,
      createdAt: proposal.createdAt,
      formats: proposal.formats.map(({ id }) => id),
      categories: proposal.categories.map(({ id }) => id),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
      })),
    },
    formats: event.formats ?? [],
    categories: event.categories ?? [],
  };
};

export const editProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, id } = params;

  const form = await request.formData();
  const result = validate(form);
  if (!result.success) {
    return result.error.flatten();
  }

  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const proposal = await db.proposal.findFirst({
    where: { id, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new Response('Proposal not found', { status: 404 });

  await db.proposal.update({
    where: { id },
    data: {
      title: result.data.title,
      abstract: result.data.abstract,
      level: result.data.level,
      references: result.data.references,
      speakers: { set: [], connect: [{ id: uid }] },
    },
  });

  if (proposal.talkId) {
    await db.talk.update({
      where: { id: proposal.talkId },
      data: { ...result.data },
    });
  }

  return redirect(`/${eventSlug}/proposals/${id}`);
};