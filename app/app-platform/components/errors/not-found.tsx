import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { ErrorDisplay } from './error-display.tsx';

type Props = { text?: string };

export function NotFound({ text }: Props) {
  const { t } = useTranslation();
  return (
    <ErrorDisplay title={text || t('common.not-found.heading')} subtitle={t('common.not-found.description')}>
      <div className="pt-8">
        <Button to="/">{t('common.go-to-home')}</Button>
      </div>
    </ErrorDisplay>
  );
}
