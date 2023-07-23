import { XMarkIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Navbar } from '~/components/navbar/Navbar';
import { IconButtonLink } from '~/design-system/IconButtons';
import { Container } from '~/design-system/layouts/Container';
import { requireSession } from '~/libs/auth/session';
import { CfpNotOpenError } from '~/libs/errors';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { eventSocialCard } from '~/libs/meta/social-cards';
import { useUser } from '~/root';
import { getEvent } from '~/server/events/get-event.server';

import { SubmissionSteps } from './components/SubmissionSteps';
import { useSubmissionStep } from './components/useSubmissionStep';

type Step = { key: string; name: string; path: string; form?: string; enabled: boolean };

export const handle = { step: 'root' };

export const meta = mergeMeta<typeof loader>(
  ({ data }) => (data ? [{ title: `${data.event.name} submission | Conference Hall` }] : []),
  ({ data }) => (data ? eventSocialCard({ name: data.event.name, slug: data.event.slug, logo: data.event.logo }) : []),
);

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await getEvent(params.event);
  if (!event.isCfpOpen) throw new CfpNotOpenError();

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
};

export default function EventSubmissionRoute() {
  const { user } = useUser();
  const { event, steps } = useLoaderData<typeof loader>();
  const { currentStepKey } = useSubmissionStep();

  return (
    <>
      <Navbar user={user} withSearch />

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