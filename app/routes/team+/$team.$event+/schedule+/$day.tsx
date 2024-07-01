import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { requireSession } from '~/libs/auth/session.ts';

import { DaySchedule } from './__components/day-schedule.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  invariant(params.day, 'Invalid day');

  const schedule = await EventSchedule.for(userId, params.team, params.event).get();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return json(schedule);
};

export default function ScheduleRoute() {
  const { day } = useParams();
  const schedule = useLoaderData<typeof loader>();

  return <DaySchedule currentDayId={day!} schedule={schedule} sessions={[]} />;
}
