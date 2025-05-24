import { useTranslation } from 'react-i18next';
import { Link, href } from 'react-router';

import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { label?: string; variant?: 'primary' | 'secondary' };

export function Logo({ label, variant = 'primary' }: Props) {
  const { t } = useTranslation();
  return (
    <Link
      to={href('/')}
      title={t('common.go-to-home')}
      className="flex items-center gap-4 truncate rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <ConferenceHallLogo width="24px" height="24px" aria-hidden className="fill-indigo-400" />
      {label ? (
        <Text as="span" weight="semibold" variant={variant === 'primary' ? 'light' : undefined} size="base">
          {label}
        </Text>
      ) : null}
    </Link>
  );
}
