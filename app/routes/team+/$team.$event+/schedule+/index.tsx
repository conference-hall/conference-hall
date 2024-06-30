import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { v4 as uuid } from 'uuid';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { requireSession } from '~/libs/auth/session.ts';

import EventScheduleComp from './__components/event-schedule.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const settings = await EventSchedule.for(userId, params.team, params.event).settings();

  if (!settings) return redirect(`/team/${params.team}/${params.event}/schedule/settings`);

  return json({ settings });
};

export default function ScheduleRoute() {
  const { settings } = useLoaderData<typeof loader>();

  const tracks = [
    { id: uuid(), name: 'Room 1' },
    { id: uuid(), name: 'Room 2' },
  ];

  return <EventScheduleComp settings={settings} tracks={tracks} />;
}
