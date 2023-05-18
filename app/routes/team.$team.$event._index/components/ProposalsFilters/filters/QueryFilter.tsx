import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '~/design-system/forms/Input';
import { Link } from '~/design-system/Links';
import { Text } from '~/design-system/Typography';

import { useProposalsSearchFilter } from '../../useProposalsSearchFilter';

type Props = { defaultValue?: string; hasFilters: boolean };

export function QueryFilter({ defaultValue, hasFilters }: Props) {
  const { addFilterFor, resetPath } = useProposalsSearchFilter();

  const debounceAddFilter = useDebouncedCallback(addFilterFor, 500);
  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <Text variant="secondary" strong>
          Search
        </Text>
        {hasFilters && (
          <Link to={resetPath} className="text-xs font-medium">
            Reset filters
          </Link>
        )}
      </div>

      <Input
        name="query"
        type="search"
        aria-label="Find a proposal"
        placeholder="Find a proposal…"
        autoComplete="off"
        defaultValue={defaultValue}
        icon={MagnifyingGlassIcon}
        onChange={(e) => debounceAddFilter('query', e.target.value)}
      />
    </div>
  );
}
