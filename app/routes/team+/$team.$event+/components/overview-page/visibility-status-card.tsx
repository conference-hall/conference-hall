import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import type { EventVisibility } from '~/types/events.types.ts';

type Props = { visibility: EventVisibility; showActions: boolean };

export function VisibilityStatusCard({ visibility, showActions }: Props) {
  const { t } = useTranslation();

  const status = visibility === 'PUBLIC' ? 'success' : 'warning';
  const label = t(`event-management.overview.visibility.${status}.heading`);
  const subtitle = t(`event-management.overview.visibility.${status}.description`);

  return (
    <StatusCard status={status} label={label} subtitle={subtitle}>
      {showActions ? (
        <Link to="settings" iconRight={ArrowRightIcon} weight="medium">
          {t('common.change')}
        </Link>
      ) : null}
    </StatusCard>
  );
}
