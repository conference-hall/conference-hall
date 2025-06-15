import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form, useSearchParams } from 'react-router';
import { Input } from '~/design-system/forms/input.tsx';
import { FiltersMenu } from './filters-menu.tsx';
import { SortMenu } from './sort-menu.tsx';

export function Filters() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { query, ...filters } = Object.fromEntries(params.entries());

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Form method="GET" className="w-full">
        {Object.keys(filters).map((key) => (
          <input key={key} type="hidden" name={key} value={filters[key]} />
        ))}
        <Input
          name="query"
          icon={MagnifyingGlassIcon}
          type="search"
          defaultValue={query}
          placeholder={t('event-management.speakers.search')}
          aria-label={t('event-management.speakers.search')}
        />
      </Form>
      <div className="flex gap-2">
        <FiltersMenu />
        <SortMenu />
      </div>
    </div>
  );
}
