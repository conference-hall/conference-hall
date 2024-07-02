import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useFetchers, useLoaderData, useParams, useSubmit } from '@remix-run/react';
import { formatISO } from 'date-fns';
import invariant from 'tiny-invariant';
import { v4 as uuid } from 'uuid';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

import { DaySchedule } from './__components/day-schedule.tsx';
import { areTimeSlotsOverlapping, moveTimeSlotStart } from './__components/schedule/timeslots.ts';
import type { Session, TimeSlot } from './__components/schedule/types.ts';

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

  // TODO: Secure to update event and schedule sessions
  switch (intent) {
    case 'add-session': {
      const result = parseWithZod(form, ScheduleSessionCreateSchema);
      if (!result.success) return json(result.error);
      await schedule.addSession(params.day, result.value);
      break;
    }
    case 'update-session': {
      const result = parseWithZod(form, ScheduleSessionUpdateSchema);
      if (!result.success) return json(result.error);
      await schedule.updateSession(result.value);
      break;
    }
  }
  return json(null);
};

export default function ScheduleRoute() {
  const { day } = useParams();
  const { name, tracks, days, sessions } = useLoaderData<typeof loader>();

  const scheduleSessions = useOptimisticSessions(sessions);

  const submit = useSubmit();

  const addSession = (trackId: string, timeslot: TimeSlot) => {
    const conflicting = scheduleSessions.some(
      (s) => s.trackId === trackId && areTimeSlotsOverlapping(timeslot, s.timeslot),
    );
    if (conflicting) return;

    const id = uuid(); // TODO: let id from DB and use an optimisticId
    submit(
      {
        intent: 'add-session',
        id,
        trackId: trackId,
        startTime: formatISO(timeslot.start),
        endTime: formatISO(timeslot.end),
      },
      { method: 'POST', navigate: false, fetcherKey: `session:${id}` },
    );
  };

  const updateSession = (session: Session, newTrackId: string, newTimeslot: TimeSlot) => {
    const updatedTimeslot = moveTimeSlotStart(session.timeslot, newTimeslot.start);

    const conflicting = scheduleSessions.some(
      (s) => s.id !== session.id && s.trackId === newTrackId && areTimeSlotsOverlapping(updatedTimeslot, s.timeslot),
    );
    if (conflicting) return;

    submit(
      {
        intent: 'update-session',
        id: session.id,
        trackId: newTrackId,
        startTime: formatISO(updatedTimeslot.start),
        endTime: formatISO(updatedTimeslot.end),
      },
      { method: 'POST', navigate: false, fetcherKey: `session:${session.id}`, unstable_flushSync: true },
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
      sessions={scheduleSessions}
    />
  );
}

type SessionData = { id: string; trackId: string; startTime: string; endTime: string };

function useOptimisticSessions(sessions: Array<SessionData>) {
  type PendingSession = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const sessionsById = new Map(
    sessions.map(({ id, trackId, startTime, endTime }) => [
      id,
      {
        id,
        trackId,
        timeslot: { start: new Date(startTime), end: new Date(endTime) },
      },
    ]),
  );

  const fetchers = useFetchers();

  const pendingSessions = fetchers
    .filter((fetcher): fetcher is PendingSession => {
      if (!fetcher.formData) return false;
      const intent = fetcher.formData.get('intent');
      return intent === 'add-session' || intent === 'update-session';
    })
    .map((fetcher) => ({
      id: String(fetcher.formData?.get('id')),
      trackId: String(fetcher.formData?.get('trackId')),
      timeslot: {
        start: new Date(String(fetcher.formData?.get('startTime'))),
        end: new Date(String(fetcher.formData?.get('endTime'))),
      },
    }));

  for (let session of pendingSessions) {
    sessionsById.set(session.id, session);
  }

  return Array.from(sessionsById.values());
}
