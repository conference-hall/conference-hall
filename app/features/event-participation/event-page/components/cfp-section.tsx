import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import {
  CallForPaperDateLabel,
  CallForPaperElapsedTimeLabel,
  CallForPaperStatusLabel,
  cfpColorStatus,
} from '~/features/event-participation/event-page/components/cfp.tsx';
import type { CfpState } from '~/shared/types/events.types.ts';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; timezone: string; className?: string };

export function CfpSection({ cfpState, cfpStart, cfpEnd, timezone }: Props) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 overflow-hidden">
        <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
        <ClientOnly>
          {() => (
            <div className="overflow-hidden">
              <H2 truncate>
                {!cfpStart || !cfpEnd ? (
                  <CallForPaperStatusLabel state={cfpState} start={cfpStart} end={cfpEnd} />
                ) : (
                  <CallForPaperElapsedTimeLabel state={cfpState} start={cfpStart} end={cfpEnd} />
                )}
              </H2>
              <Subtitle truncate>
                <CallForPaperDateLabel state={cfpState} start={cfpStart} end={cfpEnd} timezone={timezone} />
              </Subtitle>
            </div>
          )}
        </ClientOnly>
      </div>
    </section>
  );
}
