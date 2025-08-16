import { useTranslation } from 'react-i18next';
import { FilterTag } from '~/design-system/filter-tag.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';

type FiltersBadgesProps = { filters: ProposalsFilters };

export function FiltersTags({ filters }: FiltersBadgesProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const { formats, categories, tags } = event;

  const hasFilters = Boolean(
    filters.query || filters.reviews || filters.status || filters.formats || filters.categories || filters.tags,
  );

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <Text variant="secondary" weight="medium">
        {t('event-management.proposals.filters.badges')}
      </Text>
      <FilterTag name="query" value={filters.query} />
      <FilterTag name="reviews" value={filters.reviews ? t(`common.review.status.${filters.reviews}`) : undefined} />
      <FilterTag name="status" value={filters.status ? t(`common.proposals.status.${filters.status}`) : undefined} />
      <FilterTag name="formats" value={formats.find((format) => format.id === filters.formats)?.name} />
      <FilterTag name="categories" value={categories.find((category) => category.id === filters.categories)?.name} />
      <FilterTag name="tags" value={tags.find((tag) => tag.id === filters.tags)?.name} />
    </div>
  );
}
