import { useTranslation } from 'react-i18next';
import { Badge } from '~/shared/design-system/badges.tsx';

type Props = { customized: boolean };

export function EmailCustomBadge({ customized }: Props) {
  const { t } = useTranslation();

  if (customized) {
    return (
      <Badge color="green" pill>
        {t('common.customized')}
      </Badge>
    );
  }

  return <Badge pill>{t('common.default')}</Badge>;
}
