import { useLocation, useNavigate, useSearchParams } from 'react-router';

import type { ProposalsFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { Text } from '~/design-system/typography.tsx';

import { useTranslation } from 'react-i18next';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { reviewOptions, statusOptions } from './filters.ts';

type FiltersBadgesProps = { filters: ProposalsFilters };

export function FiltersTags({ filters }: FiltersBadgesProps) {
  const { t } = useTranslation();
  const { formats, categories, tags } = useCurrentEvent();

  const hasFilters = Boolean(
    filters.query || filters.reviews || filters.status || filters.formats || filters.categories || filters.tags,
  );

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <Text variant="secondary" weight="medium">
        {t('event-management.proposals.filters.badges')}
      </Text>
      <FilterTag name="query" value={filters.query} />
      <FilterTag name="reviews" value={reviewOptions.find((review) => review.value === filters.reviews)?.name} />
      <FilterTag name="status" value={statusOptions.find((status) => status.value === filters.status)?.name} />
      <FilterTag name="formats" value={formats.find((format) => format.id === filters.formats)?.name} />
      <FilterTag name="categories" value={categories.find((category) => category.id === filters.categories)?.name} />
      <FilterTag name="tags" value={tags.find((tag) => tag.id === filters.tags)?.name} />
    </div>
  );
}

type FiltersRadioProps = { name: string; value?: string };

function FilterTag({ name, value }: FiltersRadioProps) {
  const { t } = useTranslation();
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
        className="group relative -mr-1 h-3.5 w-3.5 rounded-xs hover:bg-blue-600/20"
      >
        <span className="sr-only">{t('common.remove')}</span>
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
