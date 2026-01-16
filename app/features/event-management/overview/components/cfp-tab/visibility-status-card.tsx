import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import type { EventVisibility } from '~/shared/types/events.types.ts';
import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';

type Props = { team: string; event: string; visibility: EventVisibility; showActions: boolean };

export function VisibilityStatusCard({ team, event, visibility, showActions }: Props) {
  const { t } = useTranslation();

  const status = visibility === 'PUBLIC' ? 'success' : 'warning';
  const label = t(`event-management.overview.visibility.${status}.heading`);
  const subtitle = t(`event-management.overview.visibility.${status}.description`);

  return (
    <StatusCard status={status} label={label} subtitle={subtitle}>
      {showActions ? (
        <Link to={href('/team/:team/:event/settings', { team, event })} iconRight={ArrowRightIcon} weight="medium">
          {t('common.change')}
        </Link>
      ) : null}
    </StatusCard>
  );
}
