import { useTranslation } from 'react-i18next';
import { SearchParamSelector } from '~/design-system/navigation/search-param-selector.tsx';

export function ArchivedFilters() {
  const { t } = useTranslation();
  return (
    <SearchParamSelector
      param="archived"
      defaultValue="false"
      selectors={[
        { value: 'true', label: t('common.archived') },
        { value: 'false', label: t('common.active') },
      ]}
    />
  );
}
