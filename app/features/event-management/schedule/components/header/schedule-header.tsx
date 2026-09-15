import { PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { setMinutesFromStartOfDay } from '~/shared/datetimes/datetimes.ts';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import { SessionMutations } from '../../models/session-mutation.ts';
import { useSettings } from '../../store/schedule-store.ts';
import { DisplayDays } from './display-days.tsx';
import { DisplayTimes } from './display-times.tsx';
import { OptionsMenu } from './options-menu.tsx';
import { TracksModal } from './tracks-modal.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';

const NEW_SESSION_DURATION = 30; // minutes

type Props = { zoomHandlers: ZoomHandlers };

export const ScheduleHeader = memo(function ScheduleHeader({ zoomHandlers }: Props) {
  const { t } = useTranslation();

  const { displayedDays, displayedTimes, tracks } = useSettings();
  const { onOpenSession } = useScheduleContext();
  const scheduleFullscreen = useScheduleFullscreen();

  const [tracksModalOpen, setTracksModalOpen] = useState(false);

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
        <DisplayTimes />
      </div>

      <div className="flex shrink items-center gap-3">
        <Button iconLeft={PlusIcon} onClick={onOpenNewSession}>
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
});
