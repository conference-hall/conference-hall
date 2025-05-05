import { ButtonLink } from '~/design-system/buttons.tsx';

import { useTranslation } from 'react-i18next';
import { ErrorDisplay } from './error-display.tsx';

export function InternalServerError() {
  const { t } = useTranslation();
  return (
    <ErrorDisplay title={t('error.internal.heading')} subtitle={t('error.internal.description')}>
      <div className="pt-8">
        <ButtonLink to="/">{t('common.go-to-home')}</ButtonLink>
      </div>
    </ErrorDisplay>
  );
}
