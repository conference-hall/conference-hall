import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';

type Props = { reviewEnabled: boolean; showActions: boolean };

export function ReviewStatusCard({ reviewEnabled, showActions }: Props) {
  const { t } = useTranslation();

  const status = reviewEnabled ? 'success' : 'disabled';
  const label = t(`event-management.overview.review.${status}.heading`);
  const subtitle = t(`event-management.overview.review.${status}.description`);

  return (
    <StatusCard status={status} label={label} subtitle={subtitle}>
      {showActions ? (
        <Link to="settings/review" iconRight={ArrowRightIcon} weight="medium">
          {t('common.change')}
        </Link>
      ) : null}
    </StatusCard>
  );
}
