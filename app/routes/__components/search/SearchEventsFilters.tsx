import { SearchParamSelector } from '~/design-system/navigation/SearchParamSelector';

const selectors = [
  { label: 'All', value: 'all' },
  { label: 'Conferences', value: 'conference' },
  { label: 'Meetups', value: 'meetup' },
];

export function SearchEventsFilters() {
  return <SearchParamSelector param="type" defaultValue="all" selectors={selectors} />;
}
