import { XMarkIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { EventPage } from '~/.server/event-page/event-page.ts';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { CfpNotOpenError } from '~/libs/errors.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { NestedErrorBoundary } from '~/routes/__components/error-boundary.tsx';

import { useCurrentEvent } from '~/routes/__components/contexts/event-page-context.tsx';
import { Steps } from './__components/steps.tsx';
import { SubmissionContextProvider } from './__components/submission-context.tsx';

export const handle = { step: 'root' };

export const meta = mergeMeta<typeof loader>(({ data }) =>
  data ? [{ title: `${data.event.name} submission | Conference Hall` }] : [],
);

// TODO: [submission] How to avoid this call?
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const event = await EventPage.of(params.event).get();
  if (!event.isCfpOpen) throw new CfpNotOpenError();
  return { event };
};

export default function EventSubmissionRoute() {
  const { talk } = useParams();
  const { slug, hasTracks, surveyEnabled } = useCurrentEvent();

  return (
    <SubmissionContextProvider eventSlug={slug} talkId={talk} hasTracks={hasTracks} hasSurvey={surveyEnabled}>
      <Page.NavHeader className="flex w-full items-center justify-between gap-4 py-4">
        <Steps />
        <IconLink label="Cancel submission" to={`/${slug}`} icon={XMarkIcon} variant="secondary" />
      </Page.NavHeader>

      <Outlet />
    </SubmissionContextProvider>
  );
}

export function ErrorBoundary() {
  return <NestedErrorBoundary />;
}
