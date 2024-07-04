import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { format } from 'date-fns';

import { Button } from '~/design-system/buttons.tsx';
import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { H2 } from '~/design-system/typography.tsx';

import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';

type Props = {
  currentDay: Date;
  previousDayId: string | null;
  nextDayId: string | null;
  zoomHandlers: ZoomHandlers;
};

export function ScheduleHeader({ currentDay, previousDayId, nextDayId, zoomHandlers }: Props) {
  const [searchParams] = useSearchParams();
  const scheduleFullscreen = useScheduleFullscreen();

  return (
    <header
      className={cx(
        'sticky top-0 z-30 flex flex-row items-center justify-between border-b border-b-gray-200 gap-4 h-[64px] px-6 bg-slate-100',
        {
          'rounded-t-lg': !scheduleFullscreen.isFullscreen,
        },
      )}
    >
      <div className="flex items-center gap-3 shrink">
        <IconLink
          icon={ChevronLeftIcon}
          label="Previous day"
          to={{ pathname: `../${previousDayId}`, search: searchParams.toString() }}
          relative="path"
          disabled={!previousDayId}
          variant="secondary"
        />
        <H2 truncate>
          {currentDay ? <time dateTime={format(currentDay, 'yyyy-MM-dd')}>{format(currentDay, 'PPPP')}</time> : null}
        </H2>
        <IconLink
          icon={ChevronRightIcon}
          label="Next day"
          to={{ pathname: `../${nextDayId}`, search: searchParams.toString() }}
          relative="path"
          disabled={!nextDayId}
          variant="secondary"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="mr-1 pr-6 border-r border-gray-300">
          <Button onClick={() => {}} variant="secondary" iconLeft={ClockIcon}>
            {`09:00 to 18:00`}
          </Button>
        </div>
        <IconButton
          icon={MagnifyingGlassPlusIcon}
          label="Zoom in"
          onClick={zoomHandlers.zoomIn}
          disabled={!zoomHandlers.canZoomIn}
          variant="secondary"
        />
        <IconButton
          icon={MagnifyingGlassMinusIcon}
          label="Zoom out"
          onClick={zoomHandlers.zoomOut}
          disabled={!zoomHandlers.canZoomOut}
          variant="secondary"
        />
        <IconButton
          icon={scheduleFullscreen.isFullscreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon}
          label={scheduleFullscreen.isFullscreen ? 'Collapse schedule' : 'Expand schedule'}
          onClick={scheduleFullscreen.toggle}
          variant="secondary"
        />
      </div>
    </header>
  );
}
