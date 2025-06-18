import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { ErrorDisplay } from './error-display.tsx';

type Props = { text?: string };

export function NotFound({ text }: Props) {
  const { t } = useTranslation();
  return (
    <ErrorDisplay title={text || t('common.not-found.heading')} subtitle={t('common.not-found.description')}>
      <div className="pt-8">
        <ButtonLink to="/">{t('common.go-to-home')}</ButtonLink>
      </div>
    </ErrorDisplay>
  );
}
