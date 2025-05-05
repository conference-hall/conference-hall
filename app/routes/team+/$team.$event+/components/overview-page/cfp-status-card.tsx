import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import { CallForPaperDateLabel, CallForPaperStatusLabel, cfpColorStatus } from '~/routes/components/cfp/cfp.tsx';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';
import type { CfpState } from '~/types/events.types.ts';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; timezone: string; showActions: boolean };

export function CfpStatusCard({ cfpState, cfpStart, cfpEnd, timezone, showActions }: Props) {
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
            <Link to="settings/cfp" iconRight={ArrowRightIcon} weight="medium">
              {t('common.change')}
            </Link>
          ) : null}
        </StatusCard>
      )}
    </ClientOnly>
  );
}
