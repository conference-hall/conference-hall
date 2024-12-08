import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Outlet } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import { NestedErrorBoundary } from '~/routes/components/error-boundary.tsx';
import type { Route } from './+types/_layout.ts';
import { Steps } from './components/steps.tsx';
import { SubmissionContextProvider } from './components/submission-context.tsx';

export const handle = { step: 'root' };

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export default function EventSubmissionRoute({ params }: Route.ComponentProps) {
  const { name, slug, hasTracks, hasSurvey, isCfpOpen } = useCurrentEvent();

  if (!isCfpOpen) {
    return (
      <EmptyState label="The call for papers is not open yet." icon={LockClosedIcon}>
        <ButtonLink to={`/${slug}`}>Go back to {name} page</ButtonLink>
      </EmptyState>
    );
  }

  return (
    <SubmissionContextProvider eventSlug={slug} talkId={params.talk} hasTracks={hasTracks} hasSurvey={hasSurvey}>
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
