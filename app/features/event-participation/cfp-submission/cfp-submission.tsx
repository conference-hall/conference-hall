import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { NestedErrorBoundary } from '~/app-platform/components/errors/error-boundary.tsx';
import { useCurrentEvent } from '~/features/event-participation/event-page-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { IconLink } from '~/shared/design-system/icon-buttons.tsx';
import { EmptyState } from '~/shared/design-system/layouts/empty-state.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import type { Route } from './+types/cfp-submission.ts';
import { Steps } from './components/steps.tsx';
import { SubmissionContextProvider } from './components/submission-context.tsx';

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
