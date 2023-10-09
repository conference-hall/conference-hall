import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '~/design-system/forms/Input.tsx';
import { Link } from '~/design-system/Links.tsx';
import { Text } from '~/design-system/Typography.tsx';

import { useProposalsSearchFilter } from '../../useProposalsSearchFilter.tsx';

type Props = { defaultValue?: string; hasFilters: boolean };

export function QueryFilter({ defaultValue, hasFilters }: Props) {
  const { addFilterFor, resetPath } = useProposalsSearchFilter();

  const debounceAddFilter = useDebouncedCallback(addFilterFor, 500);
  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <Text variant="secondary" weight="medium">
          Search
        </Text>
        {hasFilters && (
          <Link to={resetPath} size="xs" weight="medium">
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
