import type { ProposalStatus } from '@prisma/client';
import type { ProposalsFilters as ProposalsFiltersType } from '~/schemas/proposal';
import { Card } from '~/design-system/layouts/Card';
import { QueryFilter } from './filters/QueryFilter';
import { ReviewsFilter } from './filters/ReviewsFilter';
import { StatusFilter } from './filters/StatusFilter';
import { TracksFilter } from './filters/TracksFilter';

type Props = {
  filters: ProposalsFiltersType;
  statistics: { total: number; reviewed: number; statuses: Array<{ name: ProposalStatus; count: number }> };
  eventFormats: Array<{ id: string; name: string }>;
  eventCategories: Array<{ id: string; name: string }>;
};

export function ProposalsFilters({ filters, statistics, eventFormats, eventCategories }: Props) {
  const { total, reviewed, statuses } = statistics;
  const { query, ratings, status, formats, categories } = filters;

  const hasFilters = Boolean(query || ratings || status || formats || categories);

  return (
    <Card className="divide-y divide-gray-200">
      <QueryFilter defaultValue={query} hasFilters={hasFilters} />

      <ReviewsFilter defaultValue={ratings} reviewed={reviewed} total={total} />

      <StatusFilter defaultValue={status?.[0]} statuses={statuses} />

      <TracksFilter
        defaultFormatValue={formats}
        defaultCategorytValue={categories}
        formats={eventFormats}
        categories={eventCategories}
      />
    </Card>
  );
}
