import { Outlet, useLoaderData, useMatches } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import invariant from 'tiny-invariant';
import { mapErrorToResponse } from '~/libs/errors';
import { getEvent } from '~/shared-server/events/get-event.server';
import { SubmissionSteps } from './components/SubmissionSteps';
import { Container } from '~/design-system/Container';

export const handle = { step: 'root' };

export const loader = async ({ request, params }: LoaderArgs) => {
  await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');

  try {
    const event = await getEvent(params.event);
    if (!event.isCfpOpen) throw new Response('CFP is not opened!', { status: 403 });

    const steps = [
      {
        key: 'selection',
        name: 'Selection',
        path: `/${params.event}/submission`,
        enabled: true,
      },
      {
        key: 'proposal',
        name: 'Proposal',
        path: `/${params.event}/submission/${params.talk}`,
        enabled: true,
      },
      {
        key: 'speakers',
        name: 'Speakers',
        path: `/${params.event}/submission/${params.talk}/speakers`,
        enabled: true,
      },
      {
        key: 'tracks',
        name: 'Tracks',
        path: `/${params.event}/submission/${params.talk}/tracks`,
        enabled: event.hasTracks,
      },
      {
        key: 'survey',
        name: 'Survey',
        path: `/${params.event}/submission/${params.talk}/survey`,
        enabled: event.surveyEnabled,
      },
      {
        key: 'submission',
        name: 'Submission',
        path: `/${params.event}/submission/${params.talk}/submit`,
        enabled: true,
      },
    ];
    return json({ event, steps });
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function EventSubmissionRoute() {
  const { event, steps } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const currentStep = matches[matches.length - 1].handle?.step;

  return (
    <div className="bg-gray-100">
      <div className="sticky top-0 z-10 h-24 w-full">
        <SubmissionSteps steps={steps} currentStep={currentStep} />
      </div>

      <div className="h-full bg-gray-100">
        <Container className="space-y-8">
          <Outlet context={event} />
        </Container>
      </div>
    </div>
  );
}
