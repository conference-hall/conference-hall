import { useTranslation } from 'react-i18next';
import { FilterTag } from '~/design-system/filter-tag.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';

type FiltersBadgesProps = { filters: ProposalsFilters };

export function FiltersTags({ filters }: FiltersBadgesProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();

  const { query, reviews, status, confirmation, formats, categories, tags } = filters;

  const hasFilters = Boolean(query || reviews || status || confirmation || formats || categories || tags);
  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <Text variant="secondary" weight="medium">
        {t('event-management.proposals.filters.badges')}
      </Text>
      <FilterTag name="query" value={query} />
      <FilterTag name="reviews" value={reviews ? t(`common.review.status.${reviews}`) : undefined} />
      <FilterTag name="status" value={status ? t(`common.proposals.status.${status}`) : undefined} />
      <FilterTag name="confirmation" value={confirmation ? t(`common.proposals.status.${confirmation}`) : undefined} />
      <FilterTag name="formats" value={event.formats.find((format) => format.id === formats)?.name} />
      <FilterTag name="categories" value={event.categories.find((category) => category.id === categories)?.name} />
      <FilterTag name="tags" value={event.tags.find((tag) => tag.id === tags)?.name} />
    </div>
  );
}
