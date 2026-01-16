import { cx } from 'class-variance-authority';
import { useState } from 'react';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';
import { DisplayDays } from './display-days.tsx';
import { DisplayTimes } from './display-times.tsx';
import { OptionsMenu } from './options-menu.tsx';
import { TracksModal } from './tracks-modal.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';

type Props = {
  scheduleDays: Array<Date>;
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  timezone: string;
  tracks: Array<{ id: string; name: string }>;
  zoomHandlers: ZoomHandlers;
  onChangeDisplayDays: (start: Date, end: Date) => void;
  onChangeDisplayTime: (start: number, end: number) => void;
};

export function ScheduleHeader({
  scheduleDays,
  displayedDays,
  displayedTimes,
  timezone,
  tracks,
  zoomHandlers,
  onChangeDisplayDays,
  onChangeDisplayTime,
}: Props) {
  const [tracksModalOpen, setTracksModalOpen] = useState(false);
  const scheduleFullscreen = useScheduleFullscreen();

  return (
    <header
      className={cx(
        'sticky top-0 z-30 flex h-[64px] flex-row items-center justify-between gap-4 border-b border-b-gray-200 bg-slate-100 px-6',
        { 'rounded-t-lg': !scheduleFullscreen.isFullscreen },
      )}
    >
      <div className="flex shrink items-center gap-3">
        <DisplayDays
          scheduleDays={scheduleDays}
          displayedDays={displayedDays}
          timezone={timezone}
          onChangeDisplayDays={onChangeDisplayDays}
        />
        <DisplayTimes displayedTimes={displayedTimes} onChangeDisplayTime={onChangeDisplayTime} />
      </div>

      <div className="flex shrink items-center gap-3">
        <OptionsMenu openTracksModal={() => setTracksModalOpen(true)} zoomHandlers={zoomHandlers} />
      </div>

      <TracksModal
        key={String(tracksModalOpen)}
        initialValues={tracks}
        open={tracksModalOpen}
        onClose={() => setTracksModalOpen(false)}
      />
    </header>
  );
}
