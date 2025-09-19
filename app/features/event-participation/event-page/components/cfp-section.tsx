import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import {
  CallForPaperDateLabel,
  CallForPaperElapsedTimeLabel,
  CallForPaperStatusLabel,
  cfpColorStatus,
} from '~/features/event-participation/event-page/components/cfp.tsx';
import type { CfpState } from '~/shared/types/events.types.ts';

type Props = {
  slug: string;
  cfpState: CfpState;
  cfpStart: Date | null;
  cfpEnd: Date | null;
  timezone: string;
  className?: string;
};

export function CfpSection({ slug, cfpState, cfpStart, cfpEnd, timezone }: Props) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 overflow-hidden">
        <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
        <ClientOnly>
          {() => (
            <div>
              <H1>
                {!cfpStart || !cfpEnd ? (
                  <CallForPaperStatusLabel state={cfpState} start={cfpStart} end={cfpEnd} />
                ) : (
                  <CallForPaperElapsedTimeLabel state={cfpState} start={cfpStart} end={cfpEnd} />
                )}
              </H1>
              <Subtitle>
                <CallForPaperDateLabel state={cfpState} start={cfpStart} end={cfpEnd} timezone={timezone} />
              </Subtitle>
            </div>
          )}
        </ClientOnly>
      </div>

      {cfpState === 'OPENED' && (
        <ButtonLink to={href('/:event/submission', { event: slug })}>{t('event.nav.submit-proposal')}</ButtonLink>
      )}
    </section>
  );
}
