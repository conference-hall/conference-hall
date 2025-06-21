import { useTranslation } from 'react-i18next';
import type { ProposalsFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { FilterTag } from '~/design-system/filter-tag.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';

type FiltersBadgesProps = { filters: ProposalsFilters };

export function FiltersTags({ filters }: FiltersBadgesProps) {
  const { t } = useTranslation();
  const { formats, categories, tags } = useCurrentEvent();

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
