import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';

export function ArchivedFilters() {
  return (
    <SearchParamSelector
      param="archived"
      defaultValue="false"
      selectors={[
        { value: 'true', label: 'Archived' },
        { value: 'false', label: 'Active' },
      ]}
    />
  );
}
