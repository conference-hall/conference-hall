import { parseWithZod } from '@conform-to/zod';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { redirect } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  SchedulSessionIdSchema,
  ScheduleDisplayTimesUpdateSchema,
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/$day.ts';
import { ScheduleHeader } from './components/header/schedule-header.tsx';
import { useScheduleFullscreen } from './components/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './components/header/use-zoom-handlers.tsx';
import type { ScheduleSession } from './components/schedule.types.ts';
import Schedule from './components/schedule/schedule.tsx';
import { SessionBlock } from './components/session/session-block.tsx';
import { SessionModal } from './components/session/session-modal.tsx';
import { useDisplayTimes } from './components/use-display-times.tsx';
import { useSessions } from './components/use-sessions.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const schedule = await eventSchedule.getSchedulesByDay();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return schedule;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'add-session': {
      const result = parseWithZod(form, { schema: ScheduleSessionCreateSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await eventSchedule.addSession(result.value);
      break;
    }
    case 'update-session': {
      const result = parseWithZod(form, { schema: ScheduleSessionUpdateSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await eventSchedule.updateSession(result.value);
      break;
    }
    case 'delete-session': {
      const result = SchedulSessionIdSchema.safeParse(form.get('id'));
      if (!result.success) return toast('error', 'Something went wrong.');
      await eventSchedule.deleteSession(result.data);
      break;
    }
    case 'update-display-times': {
      const result = parseWithZod(form, { schema: ScheduleDisplayTimesUpdateSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await eventSchedule.update(result.value);
      break;
    }
  }
  return null;
};

export default function ScheduleRoute({ loaderData: schedule }: Route.ComponentProps) {
  const sessions = useSessions(schedule.sessions, schedule.timezone);
  const displayTimes = useDisplayTimes(schedule);
  const { isFullscreen } = useScheduleFullscreen();
  const zoomHandlers = useZoomHandlers();
  const [openSession, setOpenSession] = useState<ScheduleSession | null>(null);
  const onCloseSession = () => setOpenSession(null);

  const firstDay = displayTimes.scheduleDays.at(0);
  if (!firstDay) return null;

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      <h1 className="sr-only">{schedule.name}</h1>

      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        {openSession && (
          <SessionModal
            session={openSession}
            startTime={firstDay.startTime}
            endTime={firstDay.endTime}
            tracks={schedule.tracks}
            onUpdateSession={sessions.update}
            onDeleteSession={sessions.delete}
            onClose={onCloseSession}
          />
        )}

        <ScheduleHeader
          startTime={firstDay.startTime}
          endTime={firstDay.endTime}
          previousDayIndex={null}
          nextDayIndex={null}
          zoomHandlers={zoomHandlers}
          onChangeDisplayTime={displayTimes.update}
        />

        <Schedule
          displayedDays={displayTimes.scheduleDays}
          timezone={schedule.timezone}
          tracks={schedule.tracks}
          sessions={sessions.data}
          zoomLevel={zoomHandlers.level}
          onSelectSession={setOpenSession}
          onAddSession={sessions.add}
          onUpdateSession={sessions.update}
          onSwitchSessions={sessions.switch}
          renderSession={(session, height) => <SessionBlock session={session} height={height} />}
        />
      </div>
    </main>
  );
}
