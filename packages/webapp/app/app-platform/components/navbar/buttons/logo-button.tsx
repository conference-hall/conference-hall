import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { variant?: 'primary' | 'secondary'; hideLabel?: boolean; className?: string };

export function LogoButton({ variant = 'primary', hideLabel = false, className }: Props) {
  const { t } = useTranslation();
  return (
    <Link
      to={href('/')}
      aria-label={t('common.go-to-home')}
      className={cx(
        'flex items-center gap-4 truncate rounded-sm shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        className,
      )}
    >
      <ConferenceHallLogo width="24px" height="24px" aria-hidden className="fill-indigo-400 shrink-0" />
      {!hideLabel && (
        <Text as="span" weight="semibold" variant={variant === 'primary' ? 'light' : undefined} size="base">
          {t('app.title')}
        </Text>
      )}
    </Link>
  );
}
