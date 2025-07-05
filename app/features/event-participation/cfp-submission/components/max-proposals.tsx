import { FireIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { EmptyState } from '~/shared/design-system/layouts/empty-state.tsx';

type MaxProposalsReachedProps = { maxProposals: number };

export function MaxProposalsReached({ maxProposals }: MaxProposalsReachedProps) {
  const { t } = useTranslation();
  return (
    <EmptyState icon={FireIcon} label={t('event.submission.selection.max-reached', { maxProposals })}>
      <ButtonLink to="../proposals" relative="path" variant="secondary">
        {t('event.submission.selection.max-reached.button')}
      </ButtonLink>
    </EmptyState>
  );
}
