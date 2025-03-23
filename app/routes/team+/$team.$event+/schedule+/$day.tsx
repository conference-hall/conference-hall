import { parseWithZod } from '@conform-to/zod';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { redirect } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  SchedulSessionIdSchema,
  ScheduleDisplayTimesUpdateSchema,
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
  ScheduleTracksSaveSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/$day.ts';
import { ScheduleHeader } from './components/header/schedule-header.tsx';
import { useScheduleFullscreen } from './components/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './components/header/use-zoom-handlers.tsx';
import type { ScheduleSession } from './components/schedule.types.ts';
import Schedule from './components/schedule/schedule.tsx';
import { SessionBlock } from './components/session/session-block.tsx';
import { SessionModal } from './components/session/session-modal.tsx';
import { useDisplaySettings } from './components/use-display-settings.tsx';
import { useSessions } from './components/use-sessions.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const schedule = await eventSchedule.getScheduleSessions();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return schedule;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
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
    case 'save-tracks': {
      const result = parseWithZod(form, { schema: ScheduleTracksSaveSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await eventSchedule.saveTracks(result.value.tracks);
      break;
    }
    case 'delete-schedule': {
      await eventSchedule.delete();
      break;
    }
  }
  return null;
};

export default function ScheduleRoute({ loaderData: schedule }: Route.ComponentProps) {
  const sessions = useSessions(schedule.sessions, schedule.timezone);
  const settings = useDisplaySettings(schedule);
  const { isFullscreen } = useScheduleFullscreen();
  const zoomHandlers = useZoomHandlers();
  const [openSession, setOpenSession] = useState<ScheduleSession | null>(null);
  const onCloseSession = () => setOpenSession(null);

  if (settings.displayedDays.length === 0) {
    return (
      <main className="px-8 my-8 mx-auto max-w-7xl">
        <EmptyState icon={CalendarDaysIcon} label="No schedule found for the day">
          <ButtonLink to=".." relative="path">
            Go to schedule
          </ButtonLink>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      <h1 className="sr-only">{schedule.name}</h1>

      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        {openSession && (
          <SessionModal
            session={openSession}
            displayedTimes={settings.displayedTimes}
            tracks={schedule.tracks}
            onUpdateSession={sessions.update}
            onDeleteSession={sessions.delete}
            onClose={onCloseSession}
          />
        )}

        <ScheduleHeader
          scheduleDays={settings.scheduleDays}
          displayedDays={settings.displayedDays}
          displayedTimes={settings.displayedTimes}
          tracks={schedule.tracks}
          zoomHandlers={zoomHandlers}
          onChangeDisplayDays={settings.updateDisplayDays}
          onChangeDisplayTime={settings.updateDisplayTimes}
        />

        <Schedule
          displayedDays={settings.displayedDays}
          displayedTimes={settings.displayedTimes}
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
