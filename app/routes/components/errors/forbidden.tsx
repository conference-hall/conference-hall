import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { ErrorDisplay } from './error-display.tsx';

type Props = { text?: string };

export function Forbidden({ text }: Props) {
  const { t } = useTranslation();

  return (
    <ErrorDisplay title={text || t('error.forbidden.heading')} subtitle={t('error.forbidden.description')}>
      <div className="pt-8">
        <ButtonLink to="/">{t('common.go-to-home')}</ButtonLink>
      </div>
    </ErrorDisplay>
  );
}
