import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { db } from '../../services/db';
import { requireUserSession } from '../auth/auth.server';
import { validate } from './validation/talk-validation';

export type ProposalData = {
  title: string;
  abstract: string;
  references: string | null;
  level: string | null;
} | null;

export const loadProposal: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const talkId = params.talkId;
  let talk = null;
  if (talkId !== 'new') {
    talk = await db.talk.findFirst({
      select: { title: true, abstract: true, references: true, level: true },
      where: { id: talkId, speakers: { some: { id: uid } } },
    });
    if (!talk) {
      throw new Response('Talk not found', { status: 404 });
    }
  }

  return talk;
}

export const saveProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;

  const form = await request.formData();
  const result = validate(form);
  if (!result.success) {
    return result.error.flatten();
  }

  if (talkId !== 'new') {
    const talk = await db.talk.findFirst({ where: { id: talkId, speakers: { some: { id: uid } } } });
    if (!talk) throw new Response('Not your talk!', { status: 401 });
  }

  const event = await db.event.findUnique({
    select: { id: true, formats: true, categories: true, surveyEnabled: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const talk = await db.talk.upsert({
    where: { id: talkId },
    update: { ...result.data },
    create: {
      ...result.data,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  await db.proposal.upsert({
    where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
    update: {
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      references: talk.references,
      speakers: { set: [], connect: [{ id: uid }] },
    },
    create: {
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      references: talk.references,
      status: 'DRAFT',
      talk: { connect: { id: talk.id } },
      event: { connect: { id: event.id } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  if (!!event.formats.length || !!event.categories.length) {
    return redirect(`/${eventSlug}/submission/${talk.id}/tracks`);
  }
  if (event.surveyEnabled) {
    return redirect(`/${eventSlug}/submission/${talk.id}/survey`);
  }
  return redirect(`/${eventSlug}/submission/${talk.id}/submit`);
};
