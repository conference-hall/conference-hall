import { ActionFunction, redirect } from 'remix';
import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';
import { requireUserSession } from '../auth/auth.server';
import { getTalkData } from './validation/talk-form-validation';

export const saveProposal: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) throw new Response('Event not found', { status: 404 });

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new Response('CFP is not opened', { status: 403 });

  const form = await request.formData();
  const result = getTalkData(form, {
    isFormatsRequired: event.formatsRequired,
    isCategoriesRequired: event.categoriesRequired,
  });
  if (!result.success) {
    return result.error.flatten();
  }

  if (talkId !== 'new') {
    const talk = await db.talk.findFirst({ where: { id: talkId, speakers: { some: { id: uid } } } });
    if (!talk) throw new Response('Not your talk!', { status: 401 });
  }

  const { formats, categories, ...talkData } = result.data;
  const talk = await db.talk.upsert({
    where: { id: talkId },
    update: { ...talkData },
    create: {
      ...talkData,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });

  await db.proposal.upsert({
    where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
    update: {
      ...talkData,
      speakers: { set: [], connect: [{ id: uid }] },
      formats: { set: [], connect: formats?.map((f) => ({ id: f })) },
      categories: { set: [], connect: categories?.map((f) => ({ id: f })) },
    },
    create: {
      ...talkData,
      status: 'SUBMITTED',
      talk: { connect: { id: talk.id } },
      event: { connect: { id: event.id } },
      speakers: { connect: [{ id: uid }] },
      formats: { connect: formats?.map((f) => ({ id: f })) },
      categories: { connect: categories?.map((f) => ({ id: f })) },
    },
  });

  return redirect(`/${eventSlug}/submit`);
};
