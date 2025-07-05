import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { EmptyState } from '~/shared/design-system/layouts/empty-state.tsx';

export function NoSubmissionState() {
  const { t } = useTranslation();
  return (
    <EmptyState icon={RocketLaunchIcon}>
      <ButtonLink to="new" variant="primary">
        {t('event.submission.selection.new-proposal')}
      </ButtonLink>
    </EmptyState>
  );
}
