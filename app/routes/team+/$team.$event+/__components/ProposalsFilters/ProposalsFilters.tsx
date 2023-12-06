import { Card } from '~/design-system/layouts/Card.tsx';
import type { ProposalsFilters } from '~/domains/shared/ProposalSearchBuilder.types.ts';

import { QueryFilter } from './filters/QueryFilter.tsx';
import { ReviewsFilter } from './filters/ReviewsFilter.tsx';
import { StatusFilter } from './filters/StatusFilter.tsx';
import { TracksFilter } from './filters/TracksFilter.tsx';

type Props = {
  filters: ProposalsFilters;
  statistics: {
    total: number;
    reviewed: number;
    statuses: Array<{ name: 'PENDING' | 'ACCEPTED' | 'REJECTED'; count: number }>;
  };
  eventFormats: Array<{ id: string; name: string }>;
  eventCategories: Array<{ id: string; name: string }>;
};

export function ProposalsFilters({ filters, statistics, eventFormats, eventCategories }: Props) {
  const { total, reviewed, statuses } = statistics;
  const { query, reviews, deliberation, formats, categories } = filters;

  const hasFilters = Boolean(query || reviews || deliberation || formats || categories);

  return (
    <Card className="divide-y divide-gray-200">
      <QueryFilter defaultValue={query} hasFilters={hasFilters} />

      <ReviewsFilter defaultValue={reviews} reviewed={reviewed} total={total} />

      <StatusFilter defaultValue={deliberation} statuses={statuses} />

      <TracksFilter
        defaultFormatValue={formats}
        defaultCategorytValue={categories}
        formats={eventFormats}
        categories={eventCategories}
      />
    </Card>
  );
}
