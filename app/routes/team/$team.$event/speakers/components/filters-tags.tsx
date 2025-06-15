import { useTranslation } from 'react-i18next';
import type { SpeakerSearchFilters } from '~/.server/event-speakers/event-speakers.ts';
import { FilterTag } from '~/design-system/filter-tag.tsx';
import { Text } from '~/design-system/typography.tsx';

type FiltersBadgesProps = { filters: SpeakerSearchFilters };

export function FiltersTags({ filters }: FiltersBadgesProps) {
  const { t } = useTranslation();

  const hasFilters = Boolean(filters.query || filters.proposalStatus);

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <Text variant="secondary" weight="medium">
        {t('event-management.speakers.filters.badges')}
      </Text>
      <FilterTag name="query" value={filters.query} />
      <FilterTag
        name="proposalStatus"
        value={filters.proposalStatus ? t(`common.proposals.status.${filters.proposalStatus}`) : undefined}
      />
    </div>
  );
}
