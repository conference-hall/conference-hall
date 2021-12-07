import { ActionFunction, LoaderFunction, redirect } from 'remix';
import { db } from '../../services/db';
import { getEnabledQuestions, QUESTIONS } from '../../services/survey/questions';
import { requireUserSession } from '../auth/auth.server';

export const loadSurvey: LoaderFunction = async ({ params }) => {
  const event = await db.event.findUnique({
    select: { surveyEnabled: true, surveyQuestions: true },
    where: { slug: params.eventSlug },
  });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  const enabledQuestions = getEnabledQuestions(event.surveyQuestions);
  if (!event.surveyEnabled || !enabledQuestions?.length) {
    throw new Response('Event survey is not enabled', { status: 403 });
  }

  return QUESTIONS.filter(question => enabledQuestions.includes(question.name));
}

export const saveSurvey: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { eventSlug, talkId } = params;
  return redirect(`/${eventSlug}/submission/${talkId}/submit`);
};
