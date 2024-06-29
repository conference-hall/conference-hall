import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session.ts';

import EventSchedule from './__components/event-schedule.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  return null;
};

export default function ScheduleRoute() {
  return <EventSchedule />;
}
