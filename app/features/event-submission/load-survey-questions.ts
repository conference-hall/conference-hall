import { DataFunctionArgs } from '@remix-run/server-runtime';
import { db } from '../../services/db';
import { getEnabledQuestions, QUESTIONS, SurveyQuestions } from '../../services/survey/questions';

export async function loadSurveyQuestions({ params }: DataFunctionArgs): Promise<SurveyQuestions> {
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
