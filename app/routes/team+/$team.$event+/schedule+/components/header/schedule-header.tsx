import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router';

import { IconButton, IconLink } from '~/design-system/icon-buttons.tsx';
import { H2 } from '~/design-system/typography.tsx';

import { DisplayTimesMenu } from './display-times-menu.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';

type Props = {
  currentDay: Date;
  startTime: Date;
  endTime: Date;
  previousDayIndex: number | null;
  nextDayIndex: number | null;
  zoomHandlers: ZoomHandlers;
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function ScheduleHeader({
  currentDay,
  startTime,
  endTime,
  previousDayIndex,
  nextDayIndex,
  zoomHandlers,
  onChangeDisplayTime,
}: Props) {
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
          to={{ pathname: `../${previousDayIndex}`, search: searchParams.toString() }}
          relative="path"
          disabled={previousDayIndex === null}
          variant="secondary"
          preventScrollReset
        />
        <H2 truncate>
          {currentDay ? <time dateTime={format(currentDay, 'yyyy-MM-dd')}>{format(currentDay, 'PPPP')}</time> : null}
        </H2>
        <IconLink
          icon={ChevronRightIcon}
          label="Next day"
          to={{ pathname: `../${nextDayIndex}`, search: searchParams.toString() }}
          relative="path"
          disabled={nextDayIndex === null}
          variant="secondary"
          preventScrollReset
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="mr-1 pr-6 border-r border-gray-300">
          <DisplayTimesMenu startTime={startTime} endTime={endTime} onChangeDisplayTime={onChangeDisplayTime} />
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
        <IconLink icon={Cog6ToothIcon} label="Settings" to="../settings" relative="path" variant="secondary" />
      </div>
    </header>
  );
}
