import { PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { setMinutesFromStartOfDay } from '~/shared/datetimes/datetimes.ts';
import { useCurrentSchedule } from '../../context/schedule-context.tsx';
import { SessionMutations } from '../../models/session-mutation.ts';
import { DisplayDays } from './display-days.tsx';
import { DisplayTimes } from './display-times.tsx';
import { OptionsMenu } from './options-menu.tsx';
import { TracksModal } from './tracks-modal.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';

const NEW_SESSION_DURATION = 30; // minutes

type Props = { zoomHandlers: ZoomHandlers };

export function ScheduleHeader({ zoomHandlers }: Props) {
  const { displayedDays, displayedTimes, tracks, onChangeDisplayTimes, onOpenSession } = useCurrentSchedule();
  const { t } = useTranslation();
  const [tracksModalOpen, setTracksModalOpen] = useState(false);
  const scheduleFullscreen = useScheduleFullscreen();

  const onOpenNewSession = useCallback(() => {
    const day = displayedDays.at(0);
    const trackId = tracks.at(0)?.id;
    if (!day || !trackId) return;

    const { start, end } = displayedTimes;
    onOpenSession({
      mode: 'create',
      session: SessionMutations.blank({
        trackId,
        timeslot: {
          start: setMinutesFromStartOfDay(day, start),
          end: setMinutesFromStartOfDay(day, Math.min(start + NEW_SESSION_DURATION, end)),
        },
      }),
    });
  }, [onOpenSession, displayedDays, displayedTimes, tracks]);

  return (
    <header
      className={cx(
        'sticky top-0 z-30 flex h-16 flex-row items-center justify-between gap-4 border-b border-b-gray-200 bg-slate-100 px-6',
        { 'rounded-t-lg': !scheduleFullscreen.isFullscreen },
      )}
    >
      <div className="flex shrink items-center gap-3">
        <DisplayDays />
        <DisplayTimes displayedTimes={displayedTimes} onChangeDisplayTime={onChangeDisplayTimes} />
      </div>

      <div className="flex shrink items-center gap-3">
        <Button iconLeft={PlusIcon} onClick={onOpenNewSession} disabled={tracks.length === 0}>
          {t('event-management.schedule.actions.new-session')}
        </Button>
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
