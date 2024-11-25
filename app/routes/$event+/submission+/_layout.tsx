import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useParams } from '@remix-run/react';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { NestedErrorBoundary } from '~/routes/__components/error-boundary.tsx';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { useCurrentEvent } from '~/routes/__components/contexts/event-page-context.tsx';
import { Steps } from './__components/steps.tsx';
import { SubmissionContextProvider } from './__components/submission-context.tsx';

export const handle = { step: 'root' };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export default function EventSubmissionRoute() {
  const { talk } = useParams();
  const { name, slug, hasTracks, surveyEnabled, isCfpOpen } = useCurrentEvent();

  if (!isCfpOpen) {
    return (
      <EmptyState label="The call for papers is not open yet." icon={LockClosedIcon}>
        <ButtonLink to={`/${slug}`}>Go back to {name} page</ButtonLink>
      </EmptyState>
    );
  }

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
