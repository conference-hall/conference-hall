import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { z } from 'zod';
import { db } from '../../services/db';
import { getEnabledQuestions, QUESTIONS, SurveyQuestions } from '../../services/survey/questions';
import { requireUserSession } from '../auth/auth.server';

export type SurveyForm = {
  questions: SurveyQuestions;
  initialValues: { [key: string]: string | string[] | null };
};

export const loadSurvey: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const event = await db.event.findUnique({
    select: { id: true, surveyEnabled: true, surveyQuestions: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const enabledQuestions = getEnabledQuestions(event.surveyQuestions);
  if (!event.surveyEnabled || !enabledQuestions?.length) {
    throw new Response('Event survey is not enabled', { status: 403 });
  }

  const userSurvey = await db.survey.findUnique({
    select: { answers: true },
    where: { userId_eventId: { eventId: event.id, userId: uid } },
  });

  return {
    questions: QUESTIONS.filter((question) => enabledQuestions.includes(question.name)),
    initialValues: userSurvey?.answers ?? {},
  };
};

const SurveyFormSchema = z.object({
  gender: z.string().nullable(),
  tshirt: z.string().nullable(),
  accomodation: z.string().nullable(),
  transports: z.array(z.string()).nullable(),
  diet: z.array(z.string()).nullable(),
  info: z.string().nullable(),
});

export const saveSurvey: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;

  const form = await request.formData();
  const answers = SurveyFormSchema.safeParse({
    gender: form.get('gender'),
    tshirt: form.get('tshirt'),
    accomodation: form.get('accomodation'),
    transports: form.getAll('transports'),
    diet: form.getAll('diet'),
    info: form.get('info'),
  });
  if (!answers.success) throw new Response('Bad survey values', { status: 400 });

  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  await db.survey.upsert({
    where: { userId_eventId: { eventId: event.id, userId: uid } },
    update: { answers: answers.data },
    create: {
      event: { connect: { id: event.id } },
      user: { connect: { id: uid } },
      answers: answers.data,
    },
  });

  return redirect(`/${eventSlug}/submission/${talkId}/submit`);
};
