import { XMarkIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { IconButtonLink } from '~/design-system/IconButtons.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { EventPage } from '~/domains/event-page/EventPage.ts';
import { SubmissionSteps } from '~/domains/submission-funnel/SubmissionSteps.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { CfpNotOpenError } from '~/libs/errors.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { eventSocialCard } from '~/libs/meta/social-cards.ts';
import { useUser } from '~/root.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';

import { Steps } from './__components/Steps.tsx';
import { useCurrentStepKey } from './__components/useCurrentStepKey.ts';

export const handle = { step: 'root' };

export const meta = mergeMeta<typeof loader>(
  ({ data }) => (data ? [{ title: `${data.event.name} submission | Conference Hall` }] : []),
  ({ data }) => (data ? eventSocialCard({ name: data.event.name, slug: data.event.slug, logo: data.event.logo }) : []),
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await EventPage.of(params.event).get();
  if (!event.isCfpOpen) throw new CfpNotOpenError();

  const { steps } = await SubmissionSteps.for(params.event, params.talk);
  return json({ event, steps });
};

export default function EventSubmissionRoute() {
  const { user } = useUser();
  const { event, steps } = useLoaderData<typeof loader>();

  const currentStepKey = useCurrentStepKey();

  return (
    <>
      <Navbar user={user} withSearch />

      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white py-2 shadow">
        <Container className="flex w-full items-center justify-between gap-4 py-4">
          <Steps steps={steps} currentStep={currentStepKey} />
          <IconButtonLink label="Cancel submission" to={`/${event.slug}`} icon={XMarkIcon} variant="secondary" />
        </Container>
      </div>

      <PageContent className="flex flex-col">
        <Outlet context={{ user, event }} />
      </PageContent>
    </>
  );
}
