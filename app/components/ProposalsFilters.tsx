import c from 'classnames';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { AdjustmentsVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import Select from '~/design-system/forms/Select';

export default function ProposalsFilters() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          name="query"
          type="search"
          aria-label="Find a proposal"
          placeholder="Find a proposal"
          className="w-full sm:w-80"
          icon={MagnifyingGlassIcon}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="secondary" className="group flex items-center">
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
            options={[
              { id: 'ALL', label: 'All ratings' },
              { id: '1', label: 'Rated' },
              { id: '2', label: 'Not rated' },
            ]}
            value="ALL"
            className="flex-1"
            srOnly
          />
          <Select
            name="formats"
            label="Formats"
            options={[
              { id: 'ALL', label: 'All formats' },
              { id: '1', label: 'Quickie' },
              { id: '2', label: 'Conference' },
            ]}
            value="ALL"
            className="flex-1"
            srOnly
          />
          <Select
            name="categories"
            label="Categories"
            options={[
              { id: 'ALL', label: 'All categories' },
              { id: '1', label: 'Web' },
              { id: '2', label: 'Cloud' },
            ]}
            value="ALL"
            className="flex-1"
            srOnly
          />
          <Select
            name="status"
            label="Status"
            options={[
              { id: 'ALL', label: 'All statuses' },
              { id: '1', label: 'Accepted' },
              { id: '2', label: 'Rejected' },
            ]}
            value="ALL"
            className="flex-1"
            srOnly
          />
          <Select
            name="sort"
            label="Sort"
            options={[
              { id: 'NEWEST', label: 'Sort by newest' },
              { id: 'OLDERS', label: 'Sort by oldest' },
              { id: 'HIGHEST', label: 'Sort by highest ratings' },
              { id: 'LOWEST', label: 'Sort by lowest ratings' },
            ]}
            value="NEWEST"
            className="flex-1"
            srOnly
          />
        </div>
      )}
    </>
  );
}
