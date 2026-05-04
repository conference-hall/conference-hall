import { useTranslation } from 'react-i18next';
import { SortMenu as SortMenuBase } from '~/design-system/list/sort-menu.tsx';

export function SortMenu() {
  const { t } = useTranslation();

  const options = [{ value: 'name', name: t('common.sort.name') }];

  return <SortMenuBase options={options} defaultSort="name" defaultOrder="asc" />;
}
