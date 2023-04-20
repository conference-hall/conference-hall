import { useDebouncedCallback } from 'use-debounce';
import { useLocation, useSearchParams, useSubmit } from '@remix-run/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Input } from '~/design-system/forms/Input';
import Select from '~/design-system/forms/Select';
import type { ProposalsFilters as ProposalsFiltersType } from '~/schemas/proposal';
import { Card } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';
import { Link } from '~/design-system/Links';
import { ProgressBar } from '~/design-system/ProgressBar';
import { Dot } from '~/design-system/Badges';

type Props = {
  filters: ProposalsFiltersType;
  statistics: { total: number; reviewed: number; statuses: Array<{ name: string; count: number }> };
  formats: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
};

const ratingsOptions = [
  { id: '', label: 'All ratings' },
  { id: 'rated', label: 'Rated by you' },
  { id: 'not-rated', label: 'Not rated yet' },
];

const statusOptions = [
  { id: 'SUBMITTED', label: 'Submitted proposals' },
  { id: 'ACCEPTED', label: 'Accepted by organizers' },
  { id: 'REJECTED', label: 'Rejected by organizers' },
  { id: 'CONFIRMED', label: 'Confirmed by speaker' },
  { id: 'DECLINED', label: 'Declined by speaker' },
];

const sortOptions = [
  { id: 'newest', label: 'Sort by newest' },
  { id: 'oldest', label: 'Sort by oldest' },
];

export default function ProposalsFilters({ filters, statistics, formats, categories }: Props) {
  const submit = useSubmit();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'GET', action: location.pathname });
  }

  const hasFilters = Object.values(filters).filter(Boolean).length !== 0;

  const debounceHandleChange = useDebouncedCallback(handleChange, 500);

  return (
    <Card className="divide-y divide-gray-200">
      <div className="p-6">
        <Input
          name="query"
          type="search"
          aria-label="Find a proposal"
          placeholder="Find by title and speakers"
          autoComplete="off"
          defaultValue={filters.query}
          icon={MagnifyingGlassIcon}
          onChange={(e) => debounceHandleChange('query', e.target.value)}
        />
      </div>

      <div className="p-6">
        <Text size="s" mb={1}>
          {`${statistics.reviewed} / ${statistics.total} proposals reviewed`}
        </Text>
        <ProgressBar value={statistics.reviewed} max={statistics.total} />
      </div>

      {statistics.statuses.length > 0 && (
        <div className="space-y-2 p-6">
          {statistics.statuses.map((status) => (
            <div key={status.name} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-x-1.5">
                <Dot color="red" />
                <button onClick={() => handleChange('status', status.name)} className="text-sm hover:underline">
                  {statusOptions.find((s) => s.id === status.name)?.label}
                </button>
              </span>
              <Text size="xs" variant="secondary" strong>
                {status.count}
              </Text>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Text as="span" size="s" variant="secondary" strong>
            Filter and sort
          </Text>
          {hasFilters && <Link to={location.pathname}>Clear</Link>}
        </div>

        <Select
          name="ratings"
          label="Rated by you"
          onChange={handleChange}
          options={ratingsOptions}
          value={filters.ratings || ''}
          className="flex-1"
          srOnly
        />

        {formats.length > 0 && (
          <Select
            name="formats"
            label="Formats"
            onChange={handleChange}
            options={[{ id: '', label: 'All formats' }, ...formats.map(({ id, name }) => ({ id, label: name }))]}
            value={filters.formats || ''}
            className="flex-1"
            srOnly
          />
        )}

        {categories.length > 0 && (
          <Select
            name="categories"
            label="Categories"
            onChange={handleChange}
            options={[{ id: '', label: 'All categories' }, ...categories.map(({ id, name }) => ({ id, label: name }))]}
            value={filters.categories || ''}
            className="flex-1"
            srOnly
          />
        )}

        <Select
          name="sort"
          label="Sort"
          onChange={handleChange}
          options={sortOptions}
          value={filters.sort || 'newest'}
          className="flex-1"
          srOnly
        />
      </div>
    </Card>
  );
}
