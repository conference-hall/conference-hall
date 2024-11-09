import { XMarkIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { SubmissionSteps } from '~/.server/cfp-submission-funnel/submission-steps.ts';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { CfpNotOpenError } from '~/libs/errors.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { NestedErrorBoundary } from '~/routes/__components/error-boundary.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

import { Steps } from './__components/steps.tsx';
import { useCurrentStepKey } from './__components/use-current-step-key.ts';

export const handle = { step: 'root' };

export const meta = mergeMeta<typeof loader>(({ data }) =>
  data ? [{ title: `${data.event.name} submission | Conference Hall` }] : [],
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await EventPage.of(params.event).get();
  if (!event.isCfpOpen) throw new CfpNotOpenError();

  const { steps } = await SubmissionSteps.for(params.event, params.talk);
  return { event, steps };
};

export default function EventSubmissionRoute() {
  const { user } = useUser();
  const { event, steps } = useLoaderData<typeof loader>();

  const currentStepKey = useCurrentStepKey();

  return (
    <>
      <Page.NavHeader className="flex w-full items-center justify-between gap-4 py-4">
        <Steps steps={steps} currentStep={currentStepKey} />
        <IconLink label="Cancel submission" to={`/${event.slug}`} icon={XMarkIcon} variant="secondary" />
      </Page.NavHeader>

      <Outlet context={{ user, event }} />
    </>
  );
}

export function ErrorBoundary() {
  return <NestedErrorBoundary />;
}
