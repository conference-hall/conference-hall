import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';

import type { ProposalsFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { Text } from '~/design-system/typography.tsx';
import { useEvent } from '~/routes/team+/$team.$event+/__components/use-event.tsx';

import { reviewOptions, statusOptions } from './filters.ts';

type FiltersBadgesProps = { filters: ProposalsFilters };

export function FiltersTags({ filters }: FiltersBadgesProps) {
  const { event } = useEvent();
  const { formats, categories } = event;

  const hasFilters = Boolean(
    filters.query || filters.reviews || filters.status || filters.formats || filters.categories,
  );

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <Text variant="secondary" weight="medium">
        Filters:
      </Text>
      <FilterTag name="query" value={filters.query} />
      <FilterTag name="reviews" value={reviewOptions.find((review) => review.value === filters.reviews)?.name} />
      <FilterTag name="status" value={statusOptions.find((status) => status.value === filters.status)?.name} />
      <FilterTag name="formats" value={formats.find((format) => format.id === filters.formats)?.name} />
      <FilterTag name="categories" value={categories.find((category) => category.id === filters.categories)?.name} />
    </div>
  );
}

type FiltersRadioProps = { name: string; value?: string };

function FilterTag({ name, value }: FiltersRadioProps) {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  if (!value) return null;

  const onClick = () => {
    params.delete(name);
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  return (
    <span className="inline-flex items-center gap-x-0.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      {value}
      <button
        type="button"
        onClick={onClick}
        className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-blue-600/20"
      >
        <span className="sr-only">Remove</span>
        <svg
          role="presentation"
          viewBox="0 0 14 14"
          className="h-3.5 w-3.5 stroke-blue-700/50 group-hover:stroke-blue-700/75"
        >
          <path d="M4 4l6 6m0-6l-6 6" />
        </svg>
        <span className="absolute -inset-1" />
      </button>
    </span>
  );
}
