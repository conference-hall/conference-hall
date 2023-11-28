import { SearchParamSelector } from '~/design-system/navigation/SearchParamSelector';

const selectors = [
  { label: 'All', value: 'all' },
  { label: 'Conference', value: 'conference' },
  { label: 'Meetup', value: 'meetup' },
];

export function SearchEventsFilters() {
  return <SearchParamSelector param="type" defaultValue="all" selectors={selectors} />;
}
