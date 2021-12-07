import { DataFunctionArgs } from '@remix-run/server-runtime';
import { db } from '../../services/db';
import { getEnabledQuestions } from '../../services/survey/questions';

export type SubmitSteps = Array<{
  key: string;
  name: string;
  path: string;
  enabled: boolean;
}>;

export async function loadSubmissionSteps({ params }: DataFunctionArgs): Promise<SubmitSteps> {
  const { eventSlug, talkId } = params;

  const event = await db.event.findUnique({
    select: { surveyEnabled: true, surveyQuestions: true },
    where: { slug: params.eventSlug },
  });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  const enabledQuestions = getEnabledQuestions(event.surveyQuestions);
  const isSurveyStepEnabled = event.surveyEnabled && Boolean(enabledQuestions?.length);

  const steps = [
    { key: 'selection', name: 'Selection', path: `/${eventSlug}/submission`, enabled: true },
    { key: 'proposal', name: 'Your proposal', path: `/${eventSlug}/submission/${talkId}`, enabled: true },
    { key: 'survey', name: 'Survey', path: `/${eventSlug}/submission/${talkId}/survey`, enabled: isSurveyStepEnabled },
    { key: 'submission', name: 'Submission', path: `/${eventSlug}/submission/${talkId}/submit`, enabled: true },
  ];

  return steps.filter((step) => step.enabled);
}
