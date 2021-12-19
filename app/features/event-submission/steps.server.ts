import { LoaderFunction } from 'remix';
import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export type SubmitSteps = Array<{
  key: string;
  name: string;
  path: string;
  enabled: boolean;
}>;

export const loadSubmissionSteps: LoaderFunction = async ({ params }) => {
  const { eventSlug, talkId } = params;

  const event = await db.event.findUnique({
    select: {
      type: true,
      cfpStart: true,
      cfpEnd: true,
      surveyEnabled: true,
      surveyQuestions: true,
      _count: { select: { formats: true, categories: true } },
    },
    where: { slug: params.eventSlug },
  });
  if (!event) throw new Response('Event not found', { status: 404 });

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new Response('CFP is not opened', { status: 403 });

  const isSurveyStepEnabled = event.surveyEnabled;
  const isTracksStepEnabled = event._count.categories > 0 || event._count.formats > 0;

  const steps = [
    { key: 'proposal', name: 'Proposal', path: `/${eventSlug}/submission/${talkId}`, enabled: true },
    { key: 'tracks', name: 'Tracks', path: `/${eventSlug}/submission/${talkId}/tracks`, enabled: isTracksStepEnabled },
    { key: 'survey', name: 'Survey', path: `/${eventSlug}/submission/${talkId}/survey`, enabled: isSurveyStepEnabled },
    { key: 'submission', name: 'Submission', path: `/${eventSlug}/submission/${talkId}/submit`, enabled: true },
  ];

  return steps.filter((step) => step.enabled);
}
