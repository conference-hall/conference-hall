import { cx } from 'class-variance-authority';
import { StatusPill } from '~/shared/design-system/charts/status-pill.tsx';
import { Text } from '~/shared/design-system/typography.tsx';
import type { CfpState } from '~/types/events.types.ts';
import { ClientOnly } from '../utils/client-only.tsx';
import { CallForPaperStatusLabel, cfpColorStatus } from './cfp.tsx';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; className?: string };

export function CfpStatus({ cfpState, cfpStart, cfpEnd, className }: Props) {
  return (
    <div className={cx('flex items-center space-x-2 truncate', className)}>
      <StatusPill status={cfpColorStatus(cfpState, cfpStart, cfpEnd)} />
      <ClientOnly>
        {() => (
          <Text variant="secondary" weight="medium" truncate>
            <CallForPaperStatusLabel state={cfpState} start={cfpStart} end={cfpEnd} />
          </Text>
        )}
      </ClientOnly>
    </div>
  );
}
