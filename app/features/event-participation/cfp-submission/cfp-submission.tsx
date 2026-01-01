import { XMarkIcon } from '@heroicons/react/16/solid';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { NestedErrorBoundary } from '~/app-platform/components/errors/error-boundary.tsx';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEvent } from '~/features/event-participation/event-page-context.tsx';
import { requireAuth } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/cfp-submission.ts';
import { Steps } from './components/steps.tsx';
import { SubmissionContextProvider } from './components/submission-context.tsx';

export const middleware = [requireAuth];

export const handle = { step: 'root' };

export default function EventSubmissionRoute({ params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { slug, hasTracks, hasSurvey, isCfpOpen } = useCurrentEvent();

  if (!isCfpOpen) {
    return (
      <EmptyState label={t('event.submission.cfp-not-open')} icon={LockClosedIcon}>
        <Button to={href('/:event', { event: slug })}>{t('common.go-back')}</Button>
      </EmptyState>
    );
  }

  return (
    <SubmissionContextProvider eventSlug={slug} talkId={params.talk} hasTracks={hasTracks} hasSurvey={hasSurvey}>
      <Page.NavHeader className="flex w-full items-center justify-between gap-4 py-4">
        <Steps />

        <Button
          to={href('/:event', { event: slug })}
          label={t('common.cancel')}
          icon={XMarkIcon}
          variant="tertiary"
          className="hidden lg:flex"
        />
      </Page.NavHeader>

      <Outlet />
    </SubmissionContextProvider>
  );
}

export function ErrorBoundary() {
  return <NestedErrorBoundary />;
}
