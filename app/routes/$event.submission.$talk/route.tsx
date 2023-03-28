import invariant from 'tiny-invariant';
import { Outlet, useCatch, useLoaderData, useMatches } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import { getEvent } from '~/shared-server/events/get-event.server';
import { mapErrorToResponse } from '~/libs/errors';
import { Container } from '~/design-system/Container';
import { useEvent } from '~/routes/$event/route';
import { isTalkAlreadySubmitted } from './server/is-talk-already-submitted.server';
import { SubmissionSteps } from './components/SubmissionSteps';
import { Card } from '~/design-system/Card';

export type SubmitSteps = Array<{
  key: string;
  name: string;
  path: string;
  enabled: boolean;
}>;

export const handle = { step: 'root' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const { uid } = await sessionRequired(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.talk, 'Invalid talk id');

  try {
    const event = await getEvent(params.event);
    if (!event.isCfpOpen) throw new Response('CFP is not opened!', { status: 403 });

    const isAlreadySubmitted = await isTalkAlreadySubmitted(params.event, params.talk, uid);
    if (isAlreadySubmitted) throw new Response('Talk proposal already submitted.', { status: 400 });

    const steps = [
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
    return json<SubmitSteps>(steps.filter((step) => step.enabled));
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function EventSubmitRoute() {
  const event = useEvent();
  const steps = useLoaderData<SubmitSteps>();
  const matches = useMatches();
  const currentStep = matches[matches.length - 1].handle?.step;

  return (
    <Container className="md:my-8">
      <Card as="section" rounded="2xl">
        <SubmissionSteps steps={steps} currentStep={currentStep} />
        <Outlet context={event} />
      </Card>
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="my-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
