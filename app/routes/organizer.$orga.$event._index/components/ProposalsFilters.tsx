import { Input } from '~/design-system/forms/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Select from '~/design-system/forms/Select';
import { useLocation, useSearchParams, useSubmit } from '@remix-run/react';
import type { ProposalsFilters as ProposalsFiltersType } from '~/schemas/proposal';
import { useDebouncedCallback } from 'use-debounce';
import { Card } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';
import { Link } from '~/design-system/Links';

type Props = {
  filters: ProposalsFiltersType;
  formats: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
};

const ratingsOptions = [
  { id: '', label: 'All ratings' },
  { id: 'rated', label: 'Rated by you' },
  { id: 'not-rated', label: 'Not rated yet' },
];

const statusOptions = [
  { id: '', label: 'All statuses' },
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'CONFIRMED', label: 'Confirmed by speaker' },
  { id: 'DECLINED', label: 'Declined by speaker' },
];

const sortOptions = [
  { id: 'newest', label: 'Sort by newest' },
  { id: 'oldest', label: 'Sort by oldest' },
];

export default function ProposalsFilters({ filters, formats, categories }: Props) {
  const submit = useSubmit();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'GET', action: location.pathname });
  }

  const debounceHandleChange = useDebouncedCallback(handleChange, 500);

  return (
    <section className="w-1/4">
      <Card className="divide-y divide-gray-200">
        <div className="p-6">
          <Text strong heading>
            3 proposals submitted
          </Text>
        </div>

        <div className="p-6">
          <Text size="s" mb={1}>
            1 / 50 proposals reviewed
          </Text>
          <div className="h-1.5 w-full rounded-full bg-gray-200" aria-hidden>
            <div className="h-1.5 rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Text size="s" variant="secondary" strong>
              Filters
            </Text>
            <Link to={location.pathname}>Clear</Link>
          </div>

          <Input
            name="query"
            type="search"
            aria-label="Find a proposal"
            placeholder="Find a proposal"
            autoComplete="off"
            defaultValue={filters.query}
            icon={MagnifyingGlassIcon}
            onChange={(e) => debounceHandleChange('query', e.target.value)}
          />

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
              options={[
                { id: '', label: 'All categories' },
                ...categories.map(({ id, name }) => ({ id, label: name })),
              ]}
              value={filters.categories || ''}
              className="flex-1"
              srOnly
            />
          )}

          <Select
            name="status"
            label="Status"
            onChange={handleChange}
            options={statusOptions}
            value={filters.status?.[0] ?? ''}
            className="flex-1"
            srOnly
          />
        </div>

        {/* <div className="p-6">
        <Text size="base" variant="secondary" strong mb={2}>
          Sort
        </Text>
        <Select
          name="sort"
          label="Sort"
          onChange={handleChange}
          options={sortOptions}
          value={filters.sort || 'newest'}
          className="flex-1"
          srOnly
        />
      </div> */}
      </Card>
    </section>
  );
}
