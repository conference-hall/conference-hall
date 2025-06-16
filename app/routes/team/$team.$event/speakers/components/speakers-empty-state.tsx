import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Subtitle } from '~/design-system/typography.tsx';

type SpeakersEmptyStateProps = {
  query?: string;
};

export function SpeakersEmptyState({ query }: SpeakersEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={UserGroupIcon}
      label={query ? t('event-management.speakers.empty.search.title') : t('event-management.speakers.empty.title')}
    >
      <Subtitle>
        {query
          ? t('event-management.speakers.empty.search.description', { query })
          : t('event-management.speakers.empty.description')}
      </Subtitle>
    </EmptyState>
  );
}
