import c from 'classnames';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { AdjustmentsVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import Select from '~/design-system/forms/Select';
import { Form, useParams, useSearchParams, useSubmit } from '@remix-run/react';
import type { Filters } from '~/services/organizers/event.server';

type Props = {
  filters: Filters;
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
  const { query, ...others } = filters;
  const { slug, eventSlug } = useParams();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const action = `/organizer/${slug}/${eventSlug}`;

  function handleChange(name: string, id: string) {
    const params = Object.fromEntries(searchParams);
    submit({ ...params, [name]: id }, { method: 'get', action });
  }

  const defaultOpened = Object.values(others).filter(Boolean).length !== 0;
  const [filtersOpen, setFiltersOpen] = useState(defaultOpened);
  const hasFilters = defaultOpened || Boolean(query);

  return (
    <Form action={action} method="get">
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          name="query"
          type="search"
          aria-label="Find a proposal"
          placeholder="Find a proposal"
          className="w-full sm:w-80"
          autoComplete="off"
          defaultValue={query}
          icon={MagnifyingGlassIcon}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {hasFilters && (
            <ButtonLink to={action} type="reset" variant="secondary">
              Clear
            </ButtonLink>
          )}
          <Button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            variant="secondary"
            className="group flex items-center"
          >
            <AdjustmentsVerticalIcon
              className={c('mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500', {
                'rotate-180 text-indigo-400': filtersOpen,
              })}
              aria-hidden="true"
            />
            Filters
          </Button>
        </div>
      </div>
      {filtersOpen && (
        <div className="flex flex-col gap-4 pb-4 sm:flex-row">
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
            value={filters.status || ''}
            className="flex-1"
            srOnly
          />
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
      )}
    </Form>
  );
}
