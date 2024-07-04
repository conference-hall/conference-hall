import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

import { DaySchedule } from './__components/day-schedule.tsx';
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

  return (
    <DaySchedule
      name={scheduleByDay.name}
      timezone={scheduleByDay.timezone}
      currentDay={scheduleByDay.currentDay}
      previousDayIndex={scheduleByDay.previousDayIndex}
      nextDayIndex={scheduleByDay.nextDayIndex}
      tracks={scheduleByDay.tracks}
      onAddSession={sessions.add}
      onUpdateSession={sessions.update}
      sessions={sessions.data}
    />
  );
}
