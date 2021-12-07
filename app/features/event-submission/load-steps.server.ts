import { DataFunctionArgs } from '@remix-run/server-runtime';
import { db } from '../../services/db';
import { getEnabledQuestions } from '../../services/survey/questions';

export type SubmitSteps = Array<{
  key: string;
  name: string;
  enabled: boolean;
}>;

export async function loadSubmissionSteps({ params }: DataFunctionArgs): Promise<SubmitSteps> {
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
    { key: 'selection', name: 'Selection', enabled: true },
    { key: 'proposal', name: 'Your proposal', enabled: true },
    { key: 'survey', name: 'Survey', enabled: isSurveyStepEnabled },
    { key: 'submission', name: 'Submission', enabled: true },
  ];

  return steps.filter(step => step.enabled);
}
