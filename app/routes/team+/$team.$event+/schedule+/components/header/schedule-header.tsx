import {
  ArrowDownTrayIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';

import { IconButton, IconLink, iconButton } from '~/design-system/icon-buttons.tsx';

import { useParams } from 'react-router';
import { DisplayDays } from './display-days.tsx';
import { DisplayTimes } from './display-times.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';

type Props = {
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  zoomHandlers: ZoomHandlers;
  onChangeDisplayDays: (start: Date, end: Date) => void;
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function ScheduleHeader({
  scheduleDays,
  displayedDays,
  displayedTimes,
  zoomHandlers,
  onChangeDisplayDays,
  onChangeDisplayTime,
}: Props) {
  const params = useParams();
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
        <DisplayDays
          scheduleDays={scheduleDays}
          displayedDays={displayedDays}
          onChangeDisplayDays={onChangeDisplayDays}
        />
        <DisplayTimes displayedTimes={displayedTimes} onChangeDisplayTime={onChangeDisplayTime} />
      </div>

      <div className="flex items-center gap-4">
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
        <a
          href={`/team/${params.team}/${params.event}/schedule/export/json`}
          aria-label="JSON export"
          className={iconButton({ variant: 'secondary' })}
        >
          <ArrowDownTrayIcon className="size-4 text-gray-500" aria-hidden="true" />
        </a>
        <IconLink icon={Cog6ToothIcon} label="Settings" to="../settings" relative="path" variant="secondary" />
      </div>
    </header>
  );
}
