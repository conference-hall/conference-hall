import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { ErrorDisplay } from './error-display.tsx';

type Props = { text?: string };

export function Forbidden({ text }: Props) {
  const { t } = useTranslation();

  return (
    <ErrorDisplay title={text || t('error.forbidden.heading')} subtitle={t('error.forbidden.description')}>
      <div className="pt-8">
        <Button to="/">{t('common.go-to-home')}</Button>
      </div>
    </ErrorDisplay>
  );
}
