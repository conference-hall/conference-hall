import { useTranslation } from 'react-i18next';
import { SearchParamSelector } from '~/shared/design-system/navigation/search-param-selector.tsx';

export function SearchEventsFilters() {
  const { t } = useTranslation();

  const selectors = [
    { label: t('common.all'), value: 'all' },
    { label: t('home.filters.event-type.conference'), value: 'conference' },
    { label: t('home.filters.event-type.meetup'), value: 'meetup' },
  ];

  return <SearchParamSelector param="type" defaultValue="all" selectors={selectors} />;
}
