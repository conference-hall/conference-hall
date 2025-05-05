import { useTranslation } from 'react-i18next';
import { ErrorDisplay } from './error-display.tsx';

export function Maintenance() {
  const { t } = useTranslation();
  return <ErrorDisplay title={t('common.maintenance.heading')} subtitle={t('common.maintenance.description')} />;
}
