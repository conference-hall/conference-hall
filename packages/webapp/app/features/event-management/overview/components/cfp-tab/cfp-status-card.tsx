import type { CfpState } from '@conference-hall/shared/types/events.types.ts';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import {
  CallForPaperDateLabel,
  CallForPaperStatusLabel,
  cfpColorStatus,
} from '~/features/event-participation/event-page/components/cfp.tsx';

type Props = {
  team: string;
  event: string;
  cfpState: CfpState;
  cfpStart: Date | null;
  cfpEnd: Date | null;
  timezone: string;
  showActions: boolean;
};

export function CfpStatusCard({ team, event, cfpState, cfpStart, cfpEnd, timezone, showActions }: Props) {
  const { t } = useTranslation();
  return (
    <ClientOnly fallback={<StatusCard.Fallback showActions={showActions} />}>
      {() => (
        <StatusCard
          status={cfpColorStatus(cfpState, cfpStart, cfpEnd)}
          label={<CallForPaperStatusLabel state={cfpState} start={cfpStart} end={cfpEnd} />}
          subtitle={
            <CallForPaperDateLabel state={cfpState} start={cfpStart} end={cfpEnd} timezone={timezone} format="short" />
          }
        >
          {showActions ? (
            <Link
              to={href('/team/:team/:event/settings/cfp', { team, event })}
              iconRight={ArrowRightIcon}
              weight="medium"
            >
              {t('common.change')}
            </Link>
          ) : null}
        </StatusCard>
      )}
    </ClientOnly>
  );
}
