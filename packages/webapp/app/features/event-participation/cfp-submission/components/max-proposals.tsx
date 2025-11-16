import { FireIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';

type MaxProposalsReachedProps = { maxProposals: number };

export function MaxProposalsReached({ maxProposals }: MaxProposalsReachedProps) {
  const { t } = useTranslation();
  return (
    <EmptyState icon={FireIcon} label={t('event.submission.selection.max-reached', { maxProposals })}>
      <Button to="../proposals" relative="path" variant="secondary">
        {t('event.submission.selection.max-reached.button')}
      </Button>
    </EmptyState>
  );
}
