import { CheckIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { ReviewFeeling } from '@prisma/client';
import { Link, useSearchParams } from '@remix-run/react';

import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { useCheckboxSelection } from '~/design-system/forms/useCheckboxSelection';
import { List } from '~/design-system/list/List.tsx';
import { Text } from '~/design-system/Typography.tsx';
import type { ProposalsFilters } from '~/domains/shared/ProposalSearchBuilder.types';
import { ReviewNote } from '~/routes/__components/reviews/ReviewNote';

import { ExportMenu } from './actions/export-menu';
import { FiltersMenu } from './filters/filters-menu';
import { FiltersTags } from './filters/filters-tags';
import { SearchInput } from './filters/search-input';
import { SortMenu } from './filters/sort-menu';
import { ReviewsProgress } from './list/reviews-progress';

type ProposalData = {
  id: string;
  title: string;
  deliberationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  speakers: Array<{ name: string | null; picture: string | null }>;
  reviews: {
    summary?: { negatives: number; positives: number; average: number | null };
    you: { feeling: ReviewFeeling | null; note: number | null };
  };
};

type Props = {
  proposals: Array<ProposalData>;
  filters: ProposalsFilters;
  pagination: { current: number; total: number };
  statistics: { total: number; reviewed: number };
  formats: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
};

export function ProposalsList({ proposals, filters, pagination, statistics, formats, categories }: Props) {
  const [searchParams] = useSearchParams();
  const ids = proposals.map((proposal) => proposal.id);
  const selector = useCheckboxSelection(ids, statistics.total);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <SearchInput />
          <FiltersMenu formats={formats} categories={categories} />
          <SortMenu />
          <ExportMenu />
        </div>
        <FiltersTags filters={filters} formats={formats} categories={categories} />
      </div>
      <List>
        <List.Header>
          <div className="flex items-end gap-6">
            <Checkbox
              aria-label="Select current page"
              ref={selector.checkboxRef}
              checked={selector.allChecked}
              onChange={selector.toggleAll}
            >
              {selector.selection.length === 0
                ? `${statistics.total} proposals`
                : `${selector.selection.length} selected`}
            </Checkbox>
          </div>
          <div className="flex items-center gap-2">
            {selector.selection.length === 0 ? (
              <ReviewsProgress reviewed={statistics.reviewed} total={statistics.total} />
            ) : (
              <>
                <Button variant="secondary" size="s">
                  <CheckIcon className="w-4 h-4 text-green-600" aria-hidden />
                  Accept proposals
                </Button>
                <Button variant="secondary" size="s">
                  <XMarkIcon className="w-4 h-4 text-red-600" aria-hidden />
                  Reject proposals
                </Button>
              </>
            )}
          </div>
        </List.Header>
        {selector.selection.length === 25 && (
          <div className="bg-blue-50 border-b border-gray-200 px-4 py-3 sm:px-6 text-center">
            <Text variant="secondary" size="s">
              The <strong>25</strong> proposals on this page are selected.{' '}
              <button className="underline hover:font-semibold">
                Select the {statistics.total} proposals in all pages.
              </button>
            </Text>
          </div>
        )}
        <List.Content>
          {proposals.map((proposal) => {
            const { you, summary } = proposal.reviews;
            return (
              <List.Row key={proposal.id} className="hover:bg-gray-50">
                <div>
                  <Checkbox
                    aria-label={`Select proposal "${proposal.title}"`}
                    value={proposal.id}
                    checked={selector.isSelected(proposal.id)}
                    onChange={(event) => selector.toggle(proposal.id, event)}
                    className="px-4 pb-5 sm:pl-6 sm:pr-4"
                  />
                </div>
                <Link
                  to={{ pathname: `review/${proposal.id}`, search: searchParams.toString() }}
                  className="flex items-center justify-between gap-4 pr-4 py-4 sm:pr-6 grow"
                >
                  <div className="space-y-1">
                    <Text weight="semibold">{proposal.title}</Text>
                    <div className="flex gap-1">
                      <Text size="xs" variant="secondary">
                        by {proposal.speakers.map((a) => a.name).join(', ')}
                        {proposal.deliberationStatus === 'ACCEPTED' && (
                          <span>
                            &nbsp;&bull; Accepted &bull; Confirmed by speakers
                            <CheckIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-green-600" aria-hidden />
                          </span>
                        )}
                        {proposal.deliberationStatus === 'REJECTED' && (
                          <span>
                            &nbsp;&bull; Accepted &bull; Declined by speakers
                            <XMarkIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-red-600" aria-hidden />
                          </span>
                        )}
                        {proposal.deliberationStatus === 'PENDING' && (
                          <span>
                            &nbsp;&bull; Accepted &bull; Waiting for confirmation
                            <ClockIcon className="inline ml-0.5 mb-0.5 w-4 h-4 text-gray-600" aria-hidden />
                          </span>
                        )}
                      </Text>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="hidden sm:flex sm:items-center sm:gap-4">
                      <ReviewNote feeling="USER" note={you.note} />
                      {summary && <ReviewNote feeling="NEUTRAL" note={summary.average} />}
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </List.Row>
            );
          })}
        </List.Content>
        <List.PaginationFooter current={pagination.current} pages={pagination.total} total={statistics.total} />
      </List>
    </div>
  );
}
