import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';

export function NoSubmissionState() {
  const { t } = useTranslation();
  return (
    <EmptyState icon={RocketLaunchIcon}>
      <Button to="new" variant="primary">
        {t('event.submission.selection.new-proposal')}
      </Button>
    </EmptyState>
  );
}
