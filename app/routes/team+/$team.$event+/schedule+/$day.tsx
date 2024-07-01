import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';
import { formatISO } from 'date-fns';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleSessionSaveSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

import { DaySchedule } from './__components/day-schedule.tsx';
import type { Session } from './__components/schedule/types.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const schedule = await eventSchedule.get();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  const sessions = await eventSchedule.getSessionsByDay(schedule.id, params.day);

  return json({ ...schedule, sessions });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

  const schedule = EventSchedule.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');
  const result = parseWithZod(form, ScheduleSessionSaveSchema);
  if (!result.success) return json(result.error);

  // TODO: Secure to update event and schedule sessions
  switch (intent) {
    case 'add-session': {
      await schedule.addSession(params.day, result.value);
      break;
    }
    case 'update-session': {
      const sessionId = String(form.get('id'));
      await schedule.updateSession(sessionId, result.value);
      break;
    }
  }
  return json(null);
};

export default function ScheduleRoute() {
  const { day } = useParams();
  const { name, tracks, days, sessions } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();

  const addSession = (session: Session) => {
    fetcher.submit(
      {
        intent: 'add-session',
        trackId: session.trackId,
        startTime: formatISO(session.timeslot.start),
        endTime: formatISO(session.timeslot.end),
      },
      { method: 'POST' },
    );
  };

  const updateSession = (session: Session) => {
    fetcher.submit(
      {
        intent: 'update-session',
        id: session.id,
        trackId: session.trackId,
        startTime: formatISO(session.timeslot.start),
        endTime: formatISO(session.timeslot.end),
      },
      { method: 'POST' },
    );
  };

  return (
    <DaySchedule
      currentDayId={day!}
      name={name}
      tracks={tracks}
      days={days}
      onAddSession={addSession}
      onUpdateSession={updateSession}
      sessions={sessions.map((session) => ({
        ...session,
        timeslot: {
          start: new Date(session.timeslot.start),
          end: new Date(session.timeslot.end),
        },
      }))}
    />
  );
}
