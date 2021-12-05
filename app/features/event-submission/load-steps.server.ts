import { DataFunctionArgs } from '@remix-run/server-runtime';
import { db } from '../../services/db';

export type SubmitSteps = Array<{
  key: string;
  name: string;
  enabled: boolean;
}>;

export async function getSubmitSteps({ params }: DataFunctionArgs): Promise<SubmitSteps> {
  const event = await db.event.findUnique({
    select: { surveyEnabled: true },
    where: { slug: params.eventSlug },
  });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  const steps = [
    { key: 'selection', name: 'Selection', enabled: true },
    { key: 'proposal', name: 'Your proposal', enabled: true },
    { key: 'survey', name: 'Survey', enabled: true },
    { key: 'submission', name: 'Submission', enabled: true },
  ];

  return steps.filter(step => step.enabled);
}
