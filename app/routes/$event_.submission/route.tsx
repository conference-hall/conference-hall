import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import { getEvent } from '~/shared-server/events/get-event.server';
import { SubmissionSteps } from './components/SubmissionSteps';
import { Container } from '~/design-system/layouts/Container';
import { useSubmissionStep } from './hooks/useSubmissionStep';
import { useUser } from '~/root';
import { IconButtonLink } from '~/design-system/IconButtons';
import { XMarkIcon } from '@heroicons/react/24/outline';

type Step = { key: string; name: string; path: string; form?: string; enabled: boolean };

export const handle = { step: 'root' };

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  try {
    const event = await getEvent(params.event);
    if (!event.isCfpOpen) throw new Response('CFP is not open!', { status: 403 });

    const steps: Array<Step> = [
      {
        key: 'selection',
        name: 'Selection',
        form: undefined,
        path: `/${params.event}/submission`,
        enabled: true,
      },
      {
        key: 'proposal',
        name: 'Proposal',
        form: 'proposal-form',
        path: `/${params.event}/submission/${params.talk}`,
        enabled: true,
      },
      {
        key: 'speakers',
        name: 'Speakers',
        form: 'speakers-form',
        path: `/${params.event}/submission/${params.talk}/speakers`,
        enabled: true,
      },
      {
        key: 'tracks',
        name: 'Tracks',
        form: 'tracks-form',
        path: `/${params.event}/submission/${params.talk}/tracks`,
        enabled: event.hasTracks,
      },
      {
        key: 'survey',
        name: 'Survey',
        form: 'survey-form',
        path: `/${params.event}/submission/${params.talk}/survey`,
        enabled: event.surveyEnabled,
      },
      {
        key: 'submission',
        name: 'Submission',
        form: undefined,
        path: `/${params.event}/submission/${params.talk}/submit`,
        enabled: true,
      },
    ];
    return json({ event, steps: steps.filter((step) => step.enabled) });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSubmissionRoute() {
  const { user } = useUser();
  const { event, steps } = useLoaderData<typeof loader>();
  const { currentStepKey } = useSubmissionStep();

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white py-2 shadow">
        <Container className="flex w-full items-center justify-between gap-4 py-4">
          <SubmissionSteps steps={steps} currentStep={currentStepKey} />
          <IconButtonLink label="Cancel submission" to={`/${event.slug}`} icon={XMarkIcon} variant="secondary" />
        </Container>
      </div>

      <Container className="space-y-8 pb-16 pt-8">
        <Outlet context={{ user, event }} />
      </Container>
    </>
  );
}
