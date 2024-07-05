import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

import { ScheduleHeader } from './__components/header/schedule-header.tsx';
import { useScheduleFullscreen } from './__components/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './__components/header/use-zoom-handlers.tsx';
import Schedule from './__components/schedule/schedule.tsx';
import type { Session } from './__components/schedule/types.ts';
import { SessionBlock } from './__components/session-block.tsx';
import { SessionModal } from './__components/session-modal.tsx';
import { useDisplayTimes } from './__components/use-display-times.tsx';
import { useSessions } from './__components/use-sessions.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

  const eventSchedule = EventSchedule.for(userId, params.team, params.event);
  const scheduleByDay = await eventSchedule.getSchedulesByDay(Number(params.day));

  if (!scheduleByDay) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return json(scheduleByDay);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  // TODO: Secure to update event and schedule sessions
  switch (intent) {
    case 'add-session': {
      const result = parseWithZod(form, ScheduleSessionCreateSchema);
      if (!result.success) return json(result.error);
      await eventSchedule.addSession(result.value);
      break;
    }
    case 'update-session': {
      const result = parseWithZod(form, ScheduleSessionUpdateSchema);
      if (!result.success) return json(result.error);
      await eventSchedule.updateSession(result.value);
      break;
    }
  }
  return json(null);
};

export default function ScheduleRoute() {
  const scheduleByDay = useLoaderData<typeof loader>();

  const sessions = useSessions(scheduleByDay.sessions, scheduleByDay.timezone);
  const displayTimes = useDisplayTimes(scheduleByDay.currentDay, scheduleByDay.timezone, 0, 23);

  const { isFullscreen } = useScheduleFullscreen();
  const zoomHandlers = useZoomHandlers();
  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        <SessionModal session={openSession} tracks={scheduleByDay.tracks} onClose={onCloseSession} />

        <ScheduleHeader
          currentDay={displayTimes.currentDay}
          startTime={displayTimes.startTime}
          endTime={displayTimes.endTime}
          previousDayIndex={scheduleByDay.previousDayIndex}
          nextDayIndex={scheduleByDay.nextDayIndex}
          zoomHandlers={zoomHandlers}
          onChangeDisplayTime={displayTimes.onChange}
        />

        <Schedule
          day={displayTimes.currentDay}
          startTime={displayTimes.startTime}
          endTime={displayTimes.endTime}
          timezone={scheduleByDay.timezone}
          tracks={scheduleByDay.tracks}
          sessions={sessions.data}
          zoomLevel={zoomHandlers.level}
          onSelectSession={setOpenSession}
          onAddSession={sessions.add}
          onUpdateSession={sessions.update}
          renderSession={(session) => <SessionBlock session={session} />}
        />
      </div>
    </main>
  );
}
