import { useTranslation } from 'react-i18next';
import { SearchInput } from '~/shared/design-system/forms/search-input.tsx';
import { FiltersMenu } from './filters-menu.tsx';
import { SortMenu } from './sort-menu.tsx';

export function Filters() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <SearchInput
        placeholder={t('event-management.speakers.search')}
        ariaLabel={t('event-management.speakers.search')}
      />
      <div className="flex gap-2">
        <FiltersMenu />
        <SortMenu />
      </div>
    </div>
  );
}
