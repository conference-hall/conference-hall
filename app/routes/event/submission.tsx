import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-page-context.tsx';
import { NestedErrorBoundary } from '~/routes/components/error-boundary.tsx';
import type { Route } from './+types/submission.ts';
import { Steps } from './components/submission-page/steps.tsx';
import { SubmissionContextProvider } from './components/submission-page/submission-context.tsx';

export const handle = { step: 'root' };

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export default function EventSubmissionRoute({ params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { slug, hasTracks, hasSurvey, isCfpOpen } = useCurrentEvent();

  if (!isCfpOpen) {
    return (
      <EmptyState label={t('event.submission.cfp-not-open')} icon={LockClosedIcon}>
        <ButtonLink to={href('/:event', { event: slug })}>{t('common.go-back')}</ButtonLink>
      </EmptyState>
    );
  }

  return (
    <SubmissionContextProvider eventSlug={slug} talkId={params.talk} hasTracks={hasTracks} hasSurvey={hasSurvey}>
      <Page.NavHeader className="flex w-full items-center justify-between gap-4 py-4">
        <Steps />
        <IconLink
          label={t('common.cancel')}
          to={href('/:event', { event: slug })}
          icon={XMarkIcon}
          variant="secondary"
        />
      </Page.NavHeader>

      <Outlet />
    </SubmissionContextProvider>
  );
}

export function ErrorBoundary() {
  return <NestedErrorBoundary />;
}
