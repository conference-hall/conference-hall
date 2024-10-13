import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  SchedulSessionIdSchema,
  ScheduleDayIdSchema,
  ScheduleDisplayTimesUpdateSchema,
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { ScheduleHeader } from './__components/header/schedule-header.tsx';
import { useScheduleFullscreen } from './__components/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './__components/header/use-zoom-handlers.tsx';
import type { ScheduleSession } from './__components/schedule.types.ts';
import Schedule from './__components/schedule/schedule.tsx';
import { SessionBlock } from './__components/session/session-block.tsx';
import { SessionModal } from './__components/session/session-modal.tsx';
import { useDisplayTimes } from './__components/use-display-times.tsx';
import { useSessions } from './__components/use-sessions.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const result = ScheduleDayIdSchema.safeParse(params.day);
  if (!result.success) return redirect(`/team/${params.team}/${params.event}`);

  const schedule = await eventSchedule.getSchedulesByDay(result.data);
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return json(schedule);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

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
  return json(null);
};

export default function ScheduleRoute() {
  const schedule = useLoaderData<typeof loader>();

  const sessions = useSessions(schedule.sessions, schedule.timezone);

  const displayTimes = useDisplayTimes(
    schedule.currentDay,
    schedule.displayStartMinutes,
    schedule.displayEndMinutes,
    schedule.timezone,
  );

  const { isFullscreen } = useScheduleFullscreen();
  const zoomHandlers = useZoomHandlers();

  const [openSession, setOpenSession] = useState<ScheduleSession | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      <h1 className="sr-only">{schedule.name}</h1>

      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        {openSession && (
          <SessionModal
            session={openSession}
            startTime={displayTimes.startTime}
            endTime={displayTimes.endTime}
            tracks={schedule.tracks}
            onUpdateSession={sessions.update}
            onDeleteSession={sessions.delete}
            onClose={onCloseSession}
          />
        )}

        <ScheduleHeader
          currentDay={displayTimes.currentDay}
          startTime={displayTimes.startTime}
          endTime={displayTimes.endTime}
          previousDayIndex={schedule.previousDayIndex}
          nextDayIndex={schedule.nextDayIndex}
          zoomHandlers={zoomHandlers}
          onChangeDisplayTime={displayTimes.update}
        />

        <Schedule
          startTime={displayTimes.startTime}
          endTime={displayTimes.endTime}
          timezone={schedule.timezone}
          tracks={schedule.tracks}
          sessions={sessions.data}
          zoomLevel={zoomHandlers.level}
          onSelectSession={setOpenSession}
          onAddSession={sessions.add}
          onMoveSession={sessions.move}
          onSwitchSessions={sessions.switch}
          renderSession={(session) => <SessionBlock session={session} />}
        />
      </div>
    </main>
  );
}
