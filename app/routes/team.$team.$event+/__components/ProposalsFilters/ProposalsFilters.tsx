import type { ProposalStatus } from '@prisma/client';

import { Card } from '~/design-system/layouts/Card.tsx';
import type { ProposalsFilters as ProposalsFiltersType } from '~/routes/__types/proposal.ts';

import { QueryFilter } from './filters/QueryFilter.tsx';
import { ReviewsFilter } from './filters/ReviewsFilter.tsx';
import { StatusFilter } from './filters/StatusFilter.tsx';
import { TracksFilter } from './filters/TracksFilter.tsx';

type Props = {
  filters: ProposalsFiltersType;
  statistics: { total: number; reviewed: number; statuses: Array<{ name: ProposalStatus; count: number }> };
  eventFormats: Array<{ id: string; name: string }>;
  eventCategories: Array<{ id: string; name: string }>;
};

export function ProposalsFilters({ filters, statistics, eventFormats, eventCategories }: Props) {
  const { total, reviewed, statuses } = statistics;
  const { query, reviews, status, formats, categories } = filters;

  const hasFilters = Boolean(query || reviews || status || formats || categories);

  return (
    <Card className="divide-y divide-gray-200">
      <QueryFilter defaultValue={query} hasFilters={hasFilters} />

      <ReviewsFilter defaultValue={reviews} reviewed={reviewed} total={total} />

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
